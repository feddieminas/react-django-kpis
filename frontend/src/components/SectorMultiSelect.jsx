import React from "react";
import PropTypes from "prop-types";
import { default as ReactSelect } from "react-select";

//https://medium.com/geekculture/creating-multi-select-dropdown-with-checkbox-in-react-792ff2464ef3
//https://codesandbox.io/s/interesting-torvalds-whuz3?from-embed=&file=/src/index.js:860-875

const SectorMultiSelect = props => {
  if (props.allowSelectAll) {
    return (
      <ReactSelect
        {...props}
        placeholder="Select Sector..."
        options={[props.allOption, ...props.options]}
        onChange={selected => {
          if (
            selected !== null &&
            selected.length > 0 &&
            selected[selected.length - 1].value === props.allOption.value
          ) {
            return props.onChange(props.allOption)
          }
          return props.onChange(selected)
        }}
      />
    );
  }

  return <ReactSelect {...props} />
};

SectorMultiSelect.defaultProps = {
  allOption: {
    label: "Select all",
    value: "*"
  }
};

SectorMultiSelect.propTypes = {
  options: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func,
  allowSelectAll: PropTypes.bool,
  allOption: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  })
};

export default SectorMultiSelect
