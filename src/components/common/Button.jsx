const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  outline: "bg-transparent text-ink border border-line-strong hover:border-primary hover:text-primary",
  ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-canvas",
  danger: "bg-loss text-white hover:opacity-90",
};

export default function Button({
  as: Tag = "button",
  variant = "primary",
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium
        transition-colors duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none
        ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
