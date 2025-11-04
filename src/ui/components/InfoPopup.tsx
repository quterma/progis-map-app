import styles from './InfoPopup.module.css';

export type CityInfo = {
  name?: string;
  country?: string;
  pop?: string | number;
  lat?: string | number;
  lon?: string | number;
};

const rows: Array<[keyof CityInfo, string]> = [
  ['country', 'Country'],
  ['pop', 'Population'],
  ['lat', 'Lat'],
  ['lon', 'Lon'],
];

export default function InfoPopup({ data }: { data: CityInfo }) {
  const fmt = (v: string | number | undefined) =>
    typeof v === 'number'
      ? Math.abs(v) >= 1000
        ? Math.round(v).toLocaleString()
        : Number(v).toFixed(2)
      : String(v);

  const hasAnyData = rows.some(
    ([k]) => data[k] !== undefined && data[k] !== '',
  );

  return (
    <div className={styles.wrap}>
      {data.name && <div className={styles.title}>{data.name}</div>}
      {hasAnyData ? (
        rows.map(([k, label]) =>
          data[k] !== undefined && data[k] !== '' ? (
            <div key={String(k)} className={styles.row}>
              <div className={styles.label}>{label}</div>
              <div className={styles.value}>{fmt(data[k])}</div>
            </div>
          ) : null,
        )
      ) : (
        <div className={styles.empty}>No features in active layers</div>
      )}
    </div>
  );
}
