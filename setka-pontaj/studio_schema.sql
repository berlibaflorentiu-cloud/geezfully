-- Per-studio activity used by the "Tabel date" view.
CREATE TABLE IF NOT EXISTS studios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO studios (name, sort_order) VALUES ('RIO', 10), ('MEXICO', 20)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS studio_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referee_id UUID REFERENCES referees(id) ON DELETE CASCADE NOT NULL,
  studio_id UUID REFERENCES studios(id) ON DELETE RESTRICT NOT NULL,
  period DATE NOT NULL,
  tournament_day INTEGER NOT NULL DEFAULT 0,
  tournament_night INTEGER NOT NULL DEFAULT 0,
  matches_day INTEGER NOT NULL DEFAULT 0,
  matches_night INTEGER NOT NULL DEFAULT 0,
  place1_day INTEGER NOT NULL DEFAULT 0,
  place1_night INTEGER NOT NULL DEFAULT 0,
  place3_day INTEGER NOT NULL DEFAULT 0,
  place3_night INTEGER NOT NULL DEFAULT 0,
  arbitraj_day INTEGER NOT NULL DEFAULT 0,
  arbitraj_night INTEGER NOT NULL DEFAULT 0,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referee_id, studio_id, period)
);

CREATE INDEX IF NOT EXISTS studio_entries_period_idx ON studio_entries(period);
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "studios_approved" ON studios FOR ALL TO authenticated
  USING (public.is_approved()) WITH CHECK (public.is_approved());
CREATE POLICY "studio_entries_approved" ON studio_entries FOR ALL TO authenticated
  USING (public.is_approved()) WITH CHECK (public.is_approved());
GRANT SELECT, INSERT, UPDATE, DELETE ON studios, studio_entries TO authenticated;

-- Keep monthly totals synchronized with the sum of all studios.
CREATE OR REPLACE FUNCTION sync_monthly_entry_from_studios()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE rid UUID; p DATE;
BEGIN
  rid := COALESCE(NEW.referee_id, OLD.referee_id); p := COALESCE(NEW.period, OLD.period);
  INSERT INTO monthly_entries (referee_id, period)
  VALUES (rid, p) ON CONFLICT (referee_id, period) DO NOTHING;
  UPDATE monthly_entries me SET
    tournament_day=x.tournament_day, tournament_night=x.tournament_night,
    matches_day=x.matches_day, matches_night=x.matches_night,
    place1_day=x.place1_day, place1_night=x.place1_night,
    place3_day=x.place3_day, place3_night=x.place3_night,
    arbitraj_day=x.arbitraj_day, arbitraj_night=x.arbitraj_night
  FROM (SELECT
    COALESCE(SUM(tournament_day),0) tournament_day, COALESCE(SUM(tournament_night),0) tournament_night,
    COALESCE(SUM(matches_day),0) matches_day, COALESCE(SUM(matches_night),0) matches_night,
    COALESCE(SUM(place1_day),0) place1_day, COALESCE(SUM(place1_night),0) place1_night,
    COALESCE(SUM(place3_day),0) place3_day, COALESCE(SUM(place3_night),0) place3_night,
    COALESCE(SUM(arbitraj_day),0) arbitraj_day, COALESCE(SUM(arbitraj_night),0) arbitraj_night
    FROM studio_entries WHERE referee_id=rid AND period=p) x
  WHERE me.referee_id=rid AND me.period=p;
  RETURN COALESCE(NEW, OLD);
END $$;
REVOKE ALL ON FUNCTION sync_monthly_entry_from_studios() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER studio_entries_sync AFTER INSERT OR UPDATE OR DELETE ON studio_entries
FOR EACH ROW EXECUTE FUNCTION sync_monthly_entry_from_studios();
