// pages/histogram/[id].tsx
import { useRouter } from "next/router";

const HistogramPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Histogram for Show ID: {id}</h1>
      {/* Any other content or logic you'd like to add */}
    </div>
  );
};

export default HistogramPage;
