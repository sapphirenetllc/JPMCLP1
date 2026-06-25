import { Link } from 'react-router-dom';

export default function Brand({ size = 'md', to = '/' }) {
  const fontSize = size === 'lg' ? '30px' : size === 'sm' ? '20px' : '26px';
  const svgSize  = size === 'lg' ? 22 : size === 'sm' ? 14 : 18;

  return (
    <Link to={to} className="brand" aria-label="CHASE home">
      <span className="brand-word" style={{ fontSize }}> CHASE</span>
      <span className="brand-accent-mark" aria-hidden="true">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="0,0 12,9 0,18"  fill="#2d7de0" />
          <polygon points="6,0 18,9 6,18"  fill="#3b8ef5" opacity="0.72" />
        </svg>
      </span>
    </Link>
  );
}
