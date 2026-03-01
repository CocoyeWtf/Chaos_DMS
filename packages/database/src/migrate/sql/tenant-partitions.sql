-- Auto-create KPI value partitions for the next 24 months
-- Run this after the initial tenant migration creates the kpi_values table
DO $$
DECLARE
  start_date DATE;
  end_date DATE;
  partition_name TEXT;
BEGIN
  FOR i IN 0..23 LOOP
    start_date := DATE_TRUNC('month', CURRENT_DATE) + (i || ' months')::INTERVAL;
    end_date := start_date + '1 month'::INTERVAL;
    partition_name := 'kpi_values_' || TO_CHAR(start_date, 'YYYY_MM');

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF kpi_values
       FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END LOOP;
END $$;

-- Function to auto-create the next month's partition
CREATE OR REPLACE FUNCTION create_kpi_partition()
RETURNS void AS $$
DECLARE
  next_month DATE := DATE_TRUNC('month', CURRENT_DATE) + '1 month'::INTERVAL;
  partition_name TEXT := 'kpi_values_' || TO_CHAR(next_month, 'YYYY_MM');
  end_date DATE := next_month + '1 month'::INTERVAL;
BEGIN
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF kpi_values
     FOR VALUES FROM (%L) TO (%L)',
    partition_name, next_month, end_date
  );
END $$ LANGUAGE plpgsql;
