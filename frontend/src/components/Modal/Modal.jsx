import { Fragment, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

//https://github.com/BHVampire/modal/blob/main/src/components/Modal/index.js

const ModalBS = ({ content }) => {
    const [isOpen, setIsOpen] = useState(true)
    const toggle = () => { setIsOpen((prev) => !prev) }

    return isOpen
        ? <Fragment>
            <Modal show={() => setIsOpen(false)} onHide={toggle} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Row Detail
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul className="bg-primary text-white">
                        <li>{content['row'][7]['data']}</li>  {/* data retrieved from gridjs */}
                        <li>{content['row'][1]['data']}</li>
                        <li>{content['row'][2]['data']}</li>
                        <li>{content['row'][4]['data']}</li>
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggle}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
        : ''
}

export default ModalBS