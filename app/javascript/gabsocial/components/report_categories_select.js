import React, { memo } from 'react'
import { reportCategories } from '../initial_state'
import Select from './select'

function ReportCategoriesSelect({ onSelect }) {
  
  function handleOnChange(e) {
    !!onSelect && onSelect(e)
  }
    
  let options = [{ value: null, title: 'Select category' }]
  if (reportCategories) {
    for (let i = 0; i < reportCategories.length; i++) {
      const c = reportCategories[i]
      options.push({ title: c, value: c })
    }
  }

  return (
    <Select
      isSmall
      id='report-categories-select'
      onChange={handleOnChange}
      options={options}
    />
  )
}

export default memo(ReportCategoriesSelect)