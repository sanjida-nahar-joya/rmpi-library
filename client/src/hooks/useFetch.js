import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!url) return;
        let ignore = false;

        setLoading(true);
        setError('');

        api.get(url)
            .then((res) => {
                if (!ignore) setData(res.data.data);
            })
            .catch((err) => {
                if (ignore) return;
                setError(getErrorMessage(err));
                setStatus(err.response?.status || null);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        // Ignore old responses when the url changes quickly (e.g. while filtering)
        return () => {
            ignore = true;
        };
    }, [url, reloadKey]);

    const refetch = () => setReloadKey((key) => key + 1);

    return { data, loading, error, status, refetch };
};

export default useFetch;
