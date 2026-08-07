import { getRegionFlagUrl, getCountryFlagUrl, getCountryFlag } from '../../utils/regions';

interface CountryFlagProps {
  country: string;
  regionName?: string;
  size?: number;
  className?: string;
}

export function CountryFlag({ country, regionName, size = 24, className = '' }: CountryFlagProps) {
  const url = regionName
    ? getRegionFlagUrl(regionName, country)
    : getCountryFlagUrl(country);

  if (!url) {
    return <span className={`country-flag country-flag--emoji ${className}`}>{getCountryFlag(country)}</span>;
  }

  const isCircular = url.includes('hatscripts');

  return (
    <img
      src={url}
      alt={`${regionName ?? country} flag`}
      className={`country-flag ${className}`}
      style={{
        width: size,
        height: isCircular ? size : 'auto',
        maxHeight: size,
        borderRadius: isCircular ? '50%' : 4,
        objectFit: 'cover',
      }}
      loading="lazy"
      onError={(e) => {
        const img = e.currentTarget;
        const fallback = getCountryFlagUrl(country);
        if (fallback && img.src !== fallback) {
          img.src = fallback;
        }
      }}
    />
  );
}
