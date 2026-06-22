/**
 *
 * @param {string} rawValue - The raw string value from the input field (e.g., e.target.value).
 * @param {object} [options] - Configuration options.
 * @param {number} [options.min=0] - The minimum allowed value (defaults to 0).
 * @param {number} [options.max=Infinity] - The maximum allowed value (defaults to Infinity).
 * @returns {number} The cleaned, validated, and limited integer.
 */
export const cleanAndValidateInteger = (
  rawValue,
  setMinimum = 0,
  options = {}
) => {
  const { min = setMinimum, max = Infinity } = options;

  // Step 1: Remove any non-digit characters
  let cleanedValue = String(rawValue).replace(/[^0-9]/g, "");

  // Step 2: Handle empty input
  if (cleanedValue === "") {
    return min; // Return the minimum value (usually 0) if empty
  }
  cleanedValue = cleanedValue.replace(/^0+(?=\d)/, "");
  if (cleanedValue === "") {
    cleanedValue = "0";
  }

  let numericValue = parseInt(cleanedValue, 10);

  if (isNaN(numericValue)) {
    return min;
  }

  // Step 6: Apply the minimum and maximum limits
  if (numericValue < min) {
    numericValue = min;
  }
  if (numericValue > max) {
    numericValue = max;
  }

  return numericValue;
};

export const SearchFromArray = (query, searchArray, properties) => {
  if (!query.trim()) {
    return [];
  }
  const filteredResults = searchArray.filter((item) => {
    return properties.some((property) => {
      const value = item[property];
      return (
        value && value.toString().toLowerCase().includes(query.toLowerCase())
      );
    });
  });
  return filteredResults;
};

export const Detail = ({ label, value }) => (
  <div>
    <span className="font-semibold max-sm:text-sm text-blue-900/90">{label}:</span>{" "}
    <span className="text-gray-700 max-sm:text-sm break-all">{value || "N/A"}</span>
  </div>
);
export const DatePicker = ({ selected, onChange, className, ...props }) => {
  return (
    <input
      type="date"
      value={selected ? new Date(selected).toISOString().split("T")[0] : ""}
      onChange={(e) =>
        onChange(e.target.value ? new Date(e.target.value) : null)
      }
      className={className}
      {...props}
    />
  );
};
