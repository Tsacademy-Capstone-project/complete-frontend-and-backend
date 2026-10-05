import { useCallback, useEffect, useState } from "react";

import api from "../services/api";

async function fetchAllComplaints() {
  const allComplaints = [];
  let page = 1;
  let hasNextPage;

  do {
    const result = await api.getMyComplaints({ page, limit: 50 });

    if (!Array.isArray(result?.complaints)) {
      throw new Error("The server returned an invalid complaints response.");
    }

    allComplaints.push(...result.complaints);
    hasNextPage = Boolean(result.pagination?.hasNextPage);
    page += 1;
  } while (hasNextPage);

  return allComplaints;
}

export default function useMyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setComplaints(await fetchAllComplaints());
    } catch (loadError) {
      setError(
        loadError.message || "Unable to load your complaints. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleFocus = () => { refresh(); };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  useEffect(() => {
    let isCurrent = true;

    fetchAllComplaints()
      .then((allComplaints) => {
        if (isCurrent) {
          setComplaints(allComplaints);
        }
      })
      .catch((loadError) => {
        if (isCurrent) {
          setError(
            loadError.message ||
              "Unable to load your complaints. Please try again."
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return { complaints, loading, error, refresh };
}
