import React from 'react'
import PropTypes from 'prop-types'

const SummaryDetail = ({ headers, tdSumDetail }) => {
    tdSumDetail = tdSumDetail()

    return (
    <div className="col-12 col-md-10 col-lg-6 offset-lg-0 my-1 my-sm-2 my-md-auto px-md-0 table-responsive">
        <table className="table table-md mb-0">
            <caption>Summary Detail</caption>
            <thead className="table-info">
                <tr>
                    {
                        headers.map((h,index) => <th key={index} scope="col">{h}</th>)
                    }
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">{tdSumDetail.ids}</th>
                    <td>{tdSumDetail.kpiname}</td>
                    <td className={`${tdSumDetail.amount<0 ? "text-danger" : ""}`}>{tdSumDetail.amount}</td>
                    <td>{tdSumDetail.sector}</td>
                </tr>
            </tbody>
        </table>
    </div>
    )
}

SummaryDetail.defaultProps = {
    headers: ['#', 'KPIName', 'Amount', 'Sector'],
}

SummaryDetail.propTypes = {
    headers: PropTypes.array.isRequired,
}

export default SummaryDetail;