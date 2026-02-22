import { useEffect } from 'react';

interface PageHeadProps {
  title: string;
  description?: string;
}

export const PageHead = ({ title, description }: PageHeadProps) => {
  const fullTitle = title === 'AA2000 Security' ? title : `${title} | AA2000 Security`;

  useEffect(() => {
    document.title = fullTitle;

    let meta = document.querySelector('meta[name="description"]');
    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    } else if (meta) {
      meta.remove();
    }
  }, [fullTitle, description]);

  return null;
};
