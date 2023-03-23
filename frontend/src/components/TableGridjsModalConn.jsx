import React, { useState, useRef, useEffect } from 'react'
import { Grid, _ } from 'gridjs-react'
import "gridjs/dist/theme/mermaid.min.css"
import { getSiblings, parseLocaleNumber } from "../utils/Other"
import useMediaQuery from "../utils/custom_hooks"
import createModal from "../components/Modal"

const TableGridjsModalConn = ({ filteredKpis, authToken, handleEdit, handleDel }) => {
    const savedValue = useRef()
    const upToTablet = useMediaQuery('(max-width: 768px)')
    /* using useState to persist Page
    const [page, setPage] = useState(()=> localStorage.getItem('currentPage') ? +localStorage.getItem('currentPage') : null);
    */
    /* using useRef to persist Page */
    const savedPageValue = useRef(1)

    const rowClick = (e, row) => {
        e.preventDefault()
        e.nativeEvent.preventDefault()
        createModal({"row": row['_cells']})
    }

    const editClick = async (e, row) => {
        e.preventDefault()
        e.nativeEvent.preventDefault()
        const tdSiblings = getSiblings(e.target.closest('td'))

        let modDict = {}
        modDict[tdSiblings[0].getAttribute("data-column-id")] = parseInt(tdSiblings[0].getAttribute("id"))
        for (let i=1; i < tdSiblings.length; i++) {
            const key = tdSiblings[i].getAttribute("data-column-id") 
            if (key !== "updated") {
                modDict[tdSiblings[i].getAttribute("data-column-id")] = tdSiblings[i].innerText
            }
        }

        const idxs = [1, 3, 4, 6]
        const keys = ["kpiName", "subKpiCategoryOne", "subKpiCategoryTwo", "amount"]
        let i = 0; let editClickDiff = false;
        for (const [key, value] of Object.entries(modDict)) {
            if (keys.includes(key)) {
                if (key === "amount") {
                    editClickDiff = value !== (new Intl.NumberFormat("de-DE", {
                        style: "currency",
                        currency: "EUR"
                      }).format(row._cells[idxs[i]].data));
                } else {
                    editClickDiff = value !== row._cells[idxs[i]].data;
                }
                if(editClickDiff) break;
                i++;
            }
        }

        /* using useState to persist Page... keep here if one comes back to Page and person "bookmarks" his page last visited
        setPage(document.querySelector(".gridjs-currentPage").innerText)
        */
        /* using useRef to persist Page */
        savedPageValue.current = document.querySelector(".gridjs-currentPage").innerText;
        if(!editClickDiff) return;

        modDict[Object.keys(modDict)[Object.keys(modDict).length - 1]] = parseLocaleNumber(modDict[Object.keys(modDict)[Object.keys(modDict).length - 1]])

        //fetch PUT
        const response = await fetch(`http://127.0.0.1:8000/api/kpis/${modDict['id']}`, {
            method:'PUT',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authToken)
            },
            body: JSON.stringify(modDict),
        })

        if (response.status === 200) {
            //might lag some miliseconds
            modDict["updated"] = `${new Date(Date.now() - 300).toLocaleDateString()} ${new Date(Date.now() - 300).toTimeString().substring(0,8)}`
            handleEdit(modDict)
        } else {
            alert('Something went wrong. Not updated')
        }

    }

    const delClick = async (e, row) => {
        e.preventDefault()
        e.nativeEvent.preventDefault()

        const tdSiblings = getSiblings(e.target.closest('td'))
        const id = parseInt(tdSiblings[0].getAttribute("id"))

        const response = await fetch(`http://127.0.0.1:8000/api/kpis/${id}`, {
            method: 'DELETE',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authToken)
            }
        })

        if (response.status === 200) {
            handleDel(id)
        } else {
            alert('Something went wrong. Not deleted')
        }

        /* using useState to persist Page
        setPage(document.querySelector(".gridjs-currentPage").innerText)
        */
        /* using useRef to persist Page */
        savedPageValue.current = document.querySelector(".gridjs-currentPage").innerText;
    }

    const contentEditEventKeyDown = (e) => { //https://github.com/miguelgrinberg/flask-gridjs/blob/main/templates/editable_table.html
        if (e.target.tagName === 'TD' && e.target.hasAttribute("contentEditable")) {
            if (e.key === "Escape") {
                e.target.closest('td').innerText = savedValue.current
                e.target.blur()
            } else if (e.key === 'Enter') {
                e.preventDefault()
                e.target.blur()
            }
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", contentEditEventKeyDown, false)

        /* using useState to persist Page
        if (page !== null) {
            localStorage.setItem('currentPage', page);
        }
        */
        /* using useRef to persist Page */
        savedPageValue.current = localStorage.getItem('currentPage') ? +localStorage.getItem('currentPage') : 1;

        return () => {
            document.removeEventListener("keydown", contentEditEventKeyDown, false)
            /* using useRef to persist Page */
            localStorage.setItem('currentPage', savedPageValue.current);
        }
    }, []) //}, [page]) /* using useState to persist Page */

    const contentEditEvent = (e, row) => { // https://stackoverflow.com/questions/37440408/how-to-detect-esc-key-press-in-react-and-how-to-handle-it
        switch (e.type) {
            case "focus": //onFocus is like FocusIn
                savedValue.current = e.target.closest('td').innerText
                break
            case "blur": //onBlur is like FocusOut
                if (savedValue.current !== e.target.closest('td').innerText) {
                    savedValue.current = undefined
                }
                break
            //keyPress react event does not have the same as keydown event hence we need to implement the above inside UseEffect
        }
    }

    const RowIDCellAttributes = (_, row, col) => {
        if (row) {
          return {'class': '', 'id': row.cells[0].data}
        }
        else {
          return {}
        }
    }

    const editableCellAttributes = (_, row, col) => {
        if (row) {
            return {contentEditable: !upToTablet, 'onFocus': (e) => {contentEditEvent(e, row)}, 'onBlur': (e) => {contentEditEvent(e, row)}}
        }
        else {
            return {}
        }
    }

    return (
    <>
        <div className="row mt-auto gx-auto">
            <div className="col px-2 px-sm-1 p-md-0 mb-1">
                {
                filteredKpis && <Grid
                    data={
                    filteredKpis.map((kpi) =>
                        [kpi.id, kpi.kpiName, kpi.category, kpi.subKpiCategoryOne, kpi.subKpiCategoryTwo, kpi.updated, kpi.amount, kpi.owner]
                    )
                    }
                    columns={[
                    { id: 'id', name: '', attributes: RowIDCellAttributes, sort: false, formatter: (cell, row) => {
                        return _(<button className="btn btn-sm btn-dark p-1 p-md-2" style={{"marginLeft": "0.3125rem"}}  onClick={(e) => {rowClick(e, row)} }>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-display" viewBox="0 0 16 16">
                        <path d="M0 4s0-2 2-2h12s2 0 2 2v6s0 2-2 2h-4c0 .667.083 1.167.25 1.5H11a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1h.75c.167-.333.25-.833.25-1.5H2s-2 0-2-2V4zm1.398-.855a.758.758 0 0 0-.254.302A1.46 1.46 0 0 0 1 4.01V10c0 .325.078.502.145.602.07.105.17.188.302.254a1.464 1.464 0 0 0 .538.143L2.01 11H14c.325 0 .502-.078.602-.145a.758.758 0 0 0 .254-.302 1.464 1.464 0 0 0 .143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.757.757 0 0 0-.302-.254A1.46 1.46 0 0 0 13.99 3H2c-.325 0-.502.078-.602.145z"></path>
                        </svg>
                        </button>)
                        }
                    },
                    { id: 'kpiName', name: 'kpiName', 'attributes': editableCellAttributes },
                    { id: 'category', name: 'kpiSector' },
                    { id: 'subKpiCategoryOne', name: 'subKpiCategoryOne', sort: false, 'attributes': editableCellAttributes },
                    { id: 'subKpiCategoryTwo', name: 'subKpiCategoryTwo', sort: false, 'attributes': editableCellAttributes },
                    { id: 'updated', name: 'updated' },
                    { id: 'amount', name: 'amount', 'attributes': editableCellAttributes, formatter: (cell, row) => {
                            return parseFloat(cell) >= 0 ? _(<span>{new Intl.NumberFormat("de-DE", {
                                style: "currency",
                                currency: "EUR"
                              }).format(cell)}</span>) : _(<span className="text-danger">{new Intl.NumberFormat("de-DE", {
                                style: "currency",
                                currency: "EUR"
                              }).format(cell)}</span>)
                        }
                    },
                    { id: 'actions', name: 'Actions', sort: false, formatter: (cell, row) => {
                        return _(
                            <div className="d-flex justify-content-center gap-1">
                                <button className="btn btn-sm btn-warning mx-1" onClick={(e) => {editClick(e, row)} }><i className="bi bi-save"></i></button>
                                <button className="btn btn-sm btn-danger mx-1" onClick={(e) => {if (window.confirm('Do you wish to delete this item?')) {delClick(e, row)} } }><i className="bi bi-trash"></i></button>
                            </div>
                        )}
                    }
                    ]}
                    style={{
                        container: {
                            'max-width': '76.25rem',
                            'font-size': '0.93rem',
                            'width': 'inherit'
                        },
                        table: { 
                            'white-space': 'wrap',
                            'text-align': 'center'
                        },                     
                        td: {
                            'width': '1%'
                        }
                    }}
                    search={{
                        enabled: true,
                    }}
                    sort={true}
                    pagination={{
                        enabled: true,
                        limit: 10,
                        /* using useState to persist Page
                        page: page === null ? 0 : Math.min(Math.ceil(filteredKpis.length / 10) - 1, page - 1)
                        */
                        /* using useRef to persist Page */
                        page: savedPageValue.current === null ? 0 : Math.min(Math.ceil(filteredKpis.length / 10) - 1, savedPageValue.current - 1)
                    }}
                />
                }
            </div>
        </div>
    </> 
    )
}

export default TableGridjsModalConn