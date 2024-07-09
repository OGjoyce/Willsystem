import { useRef } from "react";
import { Preview, print } from 'react-html2pdf';
import { useReactToPrint } from "react-to-print";
import { Button } from "react-bootstrap";
import { forwardRef } from 'react';
var render = 0;
var fullName, spouseName;
var childs = [];
export default function PDFComponent(datas) {
    var componentRef = useRef();

    fullName = datas.datas[0].personal.fullName;

    const isMarried = datas.datas[1].marriedq.selection;
    spouseName = "";
    if (isMarried) {
        spouseName = datas.datas[2].married.firstName + " " + datas.datas[2].married.middleName + " " + datas.datas[2].married.lastName;
    }
    else {
        //add what happens if not married
    }
    const hasChilds = datas.datas[3].kidsq.selection;

    if (hasChilds) {
        const len = Object.keys(datas.datas[4].kids).length;

        for (var i = 0; i < len - 1; i++) {
            childs.push({ "name": datas.datas[4].kids[i].firstName + " " + datas.datas[4].kids[i].firstName });

        }

    }
    else {
        //add what happens if has no childs!

    }






    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (


        <><Article ref={componentRef}
            props={{
                data: datas,
                fullName: fullName,
                spouseName: spouseName,
                childs: childs
            }} />
            <Button variant="primary" onClick={handlePrint} className="mt-3">
                Download as PDF
            </Button></>

    );

}

