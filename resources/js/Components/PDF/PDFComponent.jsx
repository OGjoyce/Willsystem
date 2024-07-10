import React, { useRef } from 'react';
import { Preview, print } from 'react-html2pdf';
import { useReactToPrint } from "react-to-print";
import { Button } from "react-bootstrap";


export default function PDFComponent({ ContentComponent, datas }) {
    var componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (


        <div>
            <ContentComponent ref={componentRef} props={{ datas }} />

            <Button variant="primary" onClick={handlePrint} className="mt-3">
                Download as PDF
            </Button>
        </div>

    );

}


