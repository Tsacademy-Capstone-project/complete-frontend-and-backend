export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  className = "",
  options = [],
  textarea = false,
  rows = 5,
  helperText = "",
  ...props
}) {
  const fieldClassName = `input-field ${
    error ? "input-field-error" : ""
  } ${className}`.trim();

  return (
    <div className="input-group">
      <label htmlFor={name}>
        {label}
        {required && <span className="required-mark">*</span>}
      </label>

      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={fieldClassName}
          {...props}
        />
      ) : options.length > 0 ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={fieldClassName}
          {...props}
        >
          <option value="" disabled>
            {placeholder || `Select ${label.toLowerCase()}`}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={fieldClassName}
          {...props}
        />
      )}

      {helperText && !error && (
        <p className="form-helper">{helperText}</p>
      )}

      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
}