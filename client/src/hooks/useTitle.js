import { useEffect } from 'react';

const useTitle = (title) => {
    useEffect(() => {
        document.title = title ? `${title} | RMPI Library` : 'RMPI Library';
    }, [title]);
};

export default useTitle;
