export default function Footer() {
  return (
    <footer className="mt-10">
      <div className="container-max rule-thin pt-5 pb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <span className="eyebrow">Data · Jolpica F1 + FastF1</span>
        <span className="eyebrow">Forecast · LightGBM Quantile + 10K Monte Carlo</span>
      </div>
    </footer>
  );
}
