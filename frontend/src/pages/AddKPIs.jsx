import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext'
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import AlertMessage from '../components/AlertAddKPI';

//https://medium.com/codex/use-a-button-to-upload-files-on-your-react-app-with-bootstrap-ef963cbe8280
//https://react-bootstrap.github.io/forms/validation/
//https://stackoverflow.com/questions/6784950/can-someone-explain-how-this-stoppropagation-works
//https://stackoverflow.com/questions/63918575/validate-inputs-of-type-select-in-react-bootstrap

const AddKPIs = () => {
    const [sectors, setSectors] = useState([]);
    const [validated, setValidated] = useState({fileupload: false, singleupload: false});
    const [showAlertKPI, setShowAlertKPI] = useState({"type": null,"variant": null, "msg": null});
    let {authTokens} = useContext(AuthContext);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/categories/`, {
            method: 'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })
        .then(response => response.json())
        .then(data => setSectors(data.map(rec => ({ value: rec.id, label: rec.bunit }))));
    }, []);

    const handleUploadFileToDB = async(creListOfDict) => {
        console.log("creListOfDict 1 inner", creListOfDict);
        const response = await fetch(`http://127.0.0.1:8000/api/kpis/create`, {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens?.access)
            },
            body: JSON.stringify(creListOfDict),
        })

        if (response.status === 200) {
            alert("kpi rows added")
            setShowAlertKPI({"type": "file", "variant": "success", "msg": "KPI Rows Added !"})
        } else {
            alert('Something went wrong. Not updated')
            setShowAlertKPI({"type": "file", "variant": "danger", "msg": "KPI Rows Not Added !"})
        }

        return
    }

    const handleUploadFile = (e) => {
        e.preventDefault();
        if (e.currentTarget.checkValidity() === false) {e.stopPropagation();}
        setValidated(
            validated => (
                {...validated, ...{fileupload: true}}
            )
        );
        const file = e.target[0].files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");

        reader.onload = () => {
            const fileResult = String(reader.result).replace(/;;/g, "; ;");
            const fileResultArray = fileResult.split(/[\r\n;]+/).slice(5); //exclude row 1, the Headers
            let creListOfDict = [];
            for (let i = 0; i < fileResultArray.length; i += 5) { //loop through each row
                creListOfDict.push({
                    "category": fileResultArray[i],
                    "kpiName": fileResultArray[i+1],
                    "subKpiCategoryOne": fileResultArray[i+2] === ' ' ? null: fileResultArray[i+2],
                    "subKpiCategoryTwo": fileResultArray[i+3] === ' ' ? null: fileResultArray[i+3],
                    "amount": parseFloat(fileResultArray[i+4]).toFixed(3)
                })
            }

            if(creListOfDict.length > 0) {
                creListOfDict = creListOfDict.slice(0, Math.floor(fileResultArray.length / 5));
                handleUploadFileToDB(creListOfDict, creListOfDict);
            } else {
                setShowAlertKPI({"type": "file", "variant": "danger", "msg": "KPI Rows Not Added !"})
            }
            
            return
        }
        reader.onerror = () => {
            console.log('file error', reader.error);
            setShowAlertKPI({"type": "file", "variant": "danger", "msg": "KPI Rows Not Added !"})
            return;
        }

    }

    const handleUpload = async(e) => {
        e.preventDefault();
        console.log(e);
        if (e.currentTarget.checkValidity() === false) {e.stopPropagation();}
        setValidated(
            validated => (
                {...validated, ...{singleupload: true}}
            )
        );

        const creDict = [{
            "category": sectors.filter((rec) => parseInt(rec.value) === parseInt(e.target[0].value))[0].label,
            "kpiName": e.target[1].value,
            "subKpiCategoryOne": e.target[2].value,
            "subKpiCategoryTwo": e.target[3].value,
            "amount": parseFloat(e.target[4].value).toFixed(3)
        }]

        const response = await fetch(`http://127.0.0.1:8000/api/kpis/create`, {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens?.access)
            },
            body: JSON.stringify(creDict),
        })

        if (response.status === 200) {
            alert("kpi added")
            setShowAlertKPI({"type": "single", "variant": "success", "msg": "KPI Added !"})
        } else {
            alert('Something went wrong. Not updated')
            setShowAlertKPI({"type": "single", "variant": "danger", "msg": "KPI Not Added !"})
        }

        return
    }

    return (
        <div className="row my-3 my-sm-5 gx-auto justify-content-start">
            <div>
                <h3>File CSV Uploader (SemiColon Separated)</h3>
                { showAlertKPI.type === "file" && <AlertMessage variant={showAlertKPI.variant} msg={showAlertKPI.msg} setShowAlertKPI={setShowAlertKPI} /> }
                <Form noValidate validated={validated.fileupload} onSubmit={handleUploadFile}>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Add KPIs</Form.Label>
                        <Form.Control
                            required
                            type="file"
                            accept=".csv" 
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a csv file.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Button type="submit" variant="dark" size="lg">SUBMIT</Button>
                </Form>
            </div>
            <div className="or_divider"></div>
            <div>
                <h5>Single KPI Upload</h5>
                { showAlertKPI.type === "single" && <AlertMessage variant={showAlertKPI.variant} msg={showAlertKPI.msg} setShowAlertKPI={setShowAlertKPI} /> }
                <Form noValidate validated={validated.singleupload} onSubmit={(e) => handleUpload(e)}>
                    <Row className="my-2">
                        <Col xs="12" md="6" className="my-2">
                            <Form.Control required as="select" type="select" name="category">
                                <option value="">Select Category *</option>
                                {
                                    sectors.map((rec) =>
                                        <option key={rec.value} value={rec.value}>{rec.label}</option>
                                    )
                                }
                            </Form.Control>
                        </Col>
                        <Col xs="12" md="6" className="my-2">
                            <FloatingLabel controlId="floatingInputKPIName" label="KPI Name *">
                                <Form.Control required type="text" placeholder="KPI Name *"/>
                                <Form.Control.Feedback type="invalid">
                                    Please provide a KPI Name
                                </Form.Control.Feedback>
                            </FloatingLabel>
                        </Col>
                    </Row>
                    <Row className="my-2">
                        <Col xs="12" md="6" className="my-2">
                            <FloatingLabel controlId="floatingInputSCO" label="Sub Category One">
                                <Form.Control type="text" placeholder="Sub Category One"/>
                            </FloatingLabel>
                        </Col>
                        <Col xs="12" md="6" className="my-2">
                            <FloatingLabel controlId="floatingInputSCT" label="Sub Category Two">
                                <Form.Control type="text" placeholder="Sub Category Two"/>
                            </FloatingLabel>
                        </Col>
                    </Row>
                    <div className="d-none d-md-block" style={{ "borderTop": "5px solid #fafafa", "margin": "10px auto" }}></div>
                    <Row className="my-2">
                        <Col xs="12" md="6" className="my-2">          
                            <InputGroup size="lg">
                                <Form.Control required aria-label="Amount" placeholder="Amount *" type="number" step="0.001"/>
                                <InputGroup.Text>€</InputGroup.Text>
                                <InputGroup.Text>0.000</InputGroup.Text>
                                <Form.Control.Feedback type="invalid">
                                    Please provide an Amount
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>
                        <Col xs="12" md="4" className="my-2">
                            <Button type="submit" variant="primary" size="lg" className="w-100">ADD</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    )

}

export default AddKPIs