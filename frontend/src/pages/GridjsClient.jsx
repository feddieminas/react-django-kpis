import React, { useState, useEffect, useRef, useMemo, useCallback, useContext } from 'react'
import AuthContext from '../context/AuthContext'
import SummaryDetail from '../components/SummaryDetail'
import TableGridjsModalConn from '../components/TableGridjsModalConn'
import makeAnimated from "react-select/animated"
import SectorMultiSelect from "../components/SectorMultiSelect"
import { components } from "react-select"

//https://www.youtube.com/watch?v=E1cklb4aeXA
//https://blog.webdevsimplified.com/2020-05/memoization-in-react/
//https://www.toptal.com/react/react-memoization
//https://www.developerway.com/posts/how-to-use-memo-use-callback

const GridJS = () => {
  const [kpis, setKpis] = useState([])
  const [sectors, setSectors] = useState([])
  const [optionSelected, setoptionSelected] = useState([])
  const optionAllSelected = useRef(false)
  let {authTokens, logoutUser} = useContext(AuthContext)

  useEffect(() => {

    Promise.all(
      [
        fetch("http://127.0.0.1:8000/api/categories/", {
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        }),
        fetch("http://127.0.0.1:8000/api/kpis/", {
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })
      ])
      .then(([resCat, resKPI]) => {
        if (parseInt(resCat.status) + parseInt(resKPI.status) === 400) {
          return Promise.all([resCat.json(), resKPI.json()])
        }
        throw new Error(`${resCat.status},${resKPI.status}`)
      })
      .then(([dataCats, dataKPIs]) => {
        dataCats = dataCats.map(rec => ({ value: rec.id, label: rec.bunit }))
        setSectors(dataCats)
        dataKPIs = dataKPIs.map(rec => (
          { ...rec, updated: `${new Date(rec.updated).toLocaleDateString()} ${new Date(rec.updated).toTimeString().substring(0,8)}` }
        ))
        setKpis(dataKPIs)
      })
      .catch((err) => { //status 400 bad request, 401 is unauthorized
        const arr = err.message.split(",")
        if (arr.includes('401')) {
          logoutUser()
        }
      })

  }, [])

  const filteredKpis = useMemo(() => {
    let [ ...optionSelectedDS ] = optionSelected //DS stands for Derived State
    if ( (optionSelectedDS === undefined) || (optionSelectedDS.length === 0)) {
      optionSelectedDS = sectors
    }
    let selectedMapLabel = Array.from(optionSelectedDS).map(opt => opt.label.toLowerCase())
    if (selectedMapLabel.includes('select all')) {
      selectedMapLabel = sectors.map(opt => opt.label.toLowerCase())
    }
    return kpis.filter(k => {
      return selectedMapLabel.includes(k.category.toLowerCase())
    })
  }, [kpis, sectors, optionSelected])


  const tdSumDetail = () => {
    const details = {}
    details['ids'] = filteredKpis.length
    details['kpiname'] = filteredKpis.filter(record => record.kpiName.length > 10).length
    details['amount'] = (filteredKpis.reduce((acc, record) => {
      return acc + parseFloat(record.amount)
    }, 0) / details['ids']).toFixed(2)
    /*
    details['amount'] = filteredKpis
                            .map(record => record.amount)
                            .reduce((recordAmount, item) => recordAmount + item, 0)
    */
    details['sector'] = [...new Set(filteredKpis.map(record => record.category))].length
    return details
  }

  const Option = (props) => {
    if (props.label === "Select all") {optionAllSelected.current = props.isSelected}
    let checked = props.isSelected
    if (optionAllSelected.current) {checked=true}
    return (
      <div>
        <components.Option {...props}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => null}
          />{" "}
          <label>{props.label}</label>
        </components.Option>
      </div>
    )
  }
  
  const MultiValue = (props) => {
    if ((props.children === "Select all" && optionAllSelected.current) || 
    (props.children !== "Select all" && !optionAllSelected.current) ) {
      return (
        <components.MultiValue {...props}>
          <span>{props.data.label}</span>
        </components.MultiValue>
      )
    }
  }

  const animatedComponents = makeAnimated()

  const handleChange = (selected) => {
    if (!Array.isArray(selected)) {
      selected = [selected]
    }
    if (selected.length === sectors.length) { //if selected all sectors but not select all
      selected = [{label: 'select all', value: '*'}]
    }
    const myset = new Set(selected)
    setoptionSelected(() => [...myset.values()])
  }

  //useCallbacks
  const handleEdit = useCallback((modDict) => setKpis(
    filteredKpis.map((rec) => rec.id === modDict['id'] ? { ...rec, ...modDict } : rec)
  ), [filteredKpis])
  const handleDel = useCallback((id) => setKpis(
    filteredKpis.filter((rec) =>
        rec.id !== id
    )
  ), [filteredKpis])
  

  return (
    <>
      <div className="row my-2 gx-auto justify-content-start">
        <div className="col-12 col-md-8 col-lg-5 mb-auto px-md-0 py-1 py-md-1 py-lg-0">
          <SectorMultiSelect
            className="form-control"
            options={sectors}
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            components={{ Option, MultiValue, animatedComponents }}
            onChange={(selected) => { handleChange(selected)  }}
            allowSelectAll={true}
            value={optionSelected}
          />
        </div>
        <SummaryDetail tdSumDetail={tdSumDetail}/> 
      </div>
      <TableGridjsModalConn filteredKpis={filteredKpis} authToken={authTokens?.access} handleEdit={handleEdit} handleDel={handleDel}/>
    </>   
  )
}
 
export default GridJS