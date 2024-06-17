
import { useRef } from "react";
import { Preview, print } from 'react-html2pdf';

import { useReactToPrint } from "react-to-print";
import { Button } from "react-bootstrap";
import { forwardRef } from 'react';
import Article from "./Article";

export default function PDFComponent(datas) {
    const componentRef = useRef();
    debugger;
    console.log(componentRef.current);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (


        <><Article ref={componentRef}  />
            <Button variant="primary" onClick={handlePrint} className="mt-3">
                Download as PDF
            </Button></>

    );

}

