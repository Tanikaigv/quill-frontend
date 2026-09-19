export default function Card({ as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag
      className={`bg-surface border border-line rounded-[var(--radius-card)] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
