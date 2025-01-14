
import React, { forwardRef } from 'react';
import './content.css';

const POA1Content = forwardRef((props, ref) => {
    const capitalLetters = (word) => {
        return word ? word.toUpperCase() : '';
    };

    if (!props || !props.props || !props.props.datas) {
        return null;
    }

    const documentDOM = props.props.selectedDOMVersion
    const datasObj = props.props.datas;

    const statusObject = datasObj.reduce((acc, item) => ({ ...acc, ...item }), {});

    const personal = statusObject.personal || {};
    const spouseInfo = statusObject.married || {};
    const kids = Object.values(statusObject.kids || {});
    const relatives = Object.values(datasObj[5].relatives || {});
    const POAInfo = statusObject.poaProperty || {};

    function findPersonInfo(name, relatives, kids, spouseInfo) {
        if (!name) return { city: '', country: '', province: '', fullName: '', relation: '', telephone: '' };
        const names = name.trim();
        let person = relatives.find(rel => `${rel.firstName || ''} ${rel.lastName || ''}`.trim() === names);
        let relation = person ? person.relative : '';

        if (!person) {
            person = kids.find(kid => `${kid.firstName || ''} ${kid.lastName || ''}`.trim() === names);
            relation = person ? 'Child' : '';
        }

        if (!person && spouseInfo.firstName && spouseInfo.lastName &&
            `${spouseInfo.firstName} ${spouseInfo.lastName}`.trim() === names) {
            person = spouseInfo;
            relation = 'Spouse';
        }

        if (person) {
            return {
                city: person.city || '',
                country: person.country || '',
                province: person.province || '',
                fullName: `${person.firstName || ''} ${person.lastName || ''}`.trim(),
                relation: relation,
                telephone: person.phone || person.telephone || ''
            };
        }

        return { city: '', country: '', province: '', fullName: names, relation: '', telephone: '' };
    }

    const attorneyOne = POAInfo.poaProperty ? findPersonInfo(POAInfo.poaProperty.attorney, relatives, kids, spouseInfo) : {};
    const attorneyTwo = POAInfo.poaProperty && POAInfo.poaProperty.backups && POAInfo.poaProperty.backups.length > 0
        ? POAInfo.poaProperty.backups.map((backup) => findPersonInfo(backup, relatives, kids, spouseInfo))
        : [];
    const restrictions = POAInfo.poaProperty ? (POAInfo.poaProperty.restrictions || '') : '';



    return (
        <div ref={ref}>
            {
                documentDOM !== null
                    ? <div dangerouslySetInnerHTML={{ __html: documentDOM }} />
                    : (
                        <div className='document-container'>
                            <h2 className='document-header'>Continuing Power of Attorney for Property of {personal.fullName || ''}</h2>
                            <br />
                            <p><strong>CONTINUING POWER OF ATTORNEY FOR PROPERTY OF {capitalLetters(personal.fullName)}</strong></p>
                            <p>
                                I, {capitalLetters(personal.fullName)} of {capitalLetters(personal.city)}
                                {personal.province ? `, ${capitalLetters(personal.province)}` : ""}, revoke any previous continuing Power of Attorney for
                                Property made by me and APPOINT {attorneyOne.relation ? `, my ${attorneyOne.relation}` : ""} {capitalLetters(attorneyOne.fullName)}
                                {attorneyOne.city && ` of ${capitalLetters(attorneyOne.city)}`}
                                {attorneyOne.province ? `, ${capitalLetters(attorneyOne.province)}` : ""} to be my sole Attorney for
                                Property (my "Attorney").
                            </p>

                            {attorneyTwo && attorneyTwo.length > 0 && (
                                <p>
                                    If {capitalLetters(attorneyOne.fullName)} cannot or will not be my Attorney because of refusal, resignation, death, mental incapacity, or
                                    removal by the court, I SUBSTITUTE {capitalLetters(attorneyTwo[0].fullName)}
                                    {attorneyTwo[0].relation ? `, my ${attorneyTwo[0].relation.toLowerCase()}` : ""}
                                    {attorneyTwo[0].city && ` of ${capitalLetters(attorneyTwo[0].city)}`}
                                    {attorneyTwo[0].province ? `, ${capitalLetters(attorneyTwo[0].province)}` : ""} to be my sole Attorney.
                                </p>
                            )}

                            {attorneyTwo && attorneyTwo.length > 1 &&
                                attorneyTwo.slice(1).map((backup, index) => (
                                    <p key={index}>
                                        If {capitalLetters(attorneyTwo[index].fullName)} cannot or will not be my Attorney because of refusal, resignation, death, mental incapacity, or
                                        removal by the court, I SUBSTITUTE {capitalLetters(backup.fullName)}
                                        {backup.relation ? `, my ${backup.relation.toLowerCase()}` : ""}
                                        {backup.city && ` of ${capitalLetters(backup.city)}`}
                                        {backup.province ? `, ${capitalLetters(backup.province)}` : ""} to be my sole Attorney.
                                    </p>
                                ))
                            }

                            <p>As used in this document:</p>

                            <ul>
                                <li>"Act" means the Ontario Substitute Decisions Act 1992, R.S.O. 1992, c.30.</li>
                                <li>"Assessor" means a person who is designated by the regulations to the Act as being qualified to do
                                    assessments of Capacity.</li>
                                <li>"Capacity" means the person is able to understand information that is relevant to making a decision
                                    concerning his or her own health care, nutrition, shelter, clothing, hygiene or safety, and is able to
                                    appreciate the reasonably foreseeable consequences of a decision or lack of decision.</li>
                            </ul>
                            <p>I AUTHORIZE subject to the law and to any conditions or restrictions contained in this document, my
                                Attorney(s) to do on my behalf any acts which can be performed by an Attorney, and specifically without
                                limitation anything in respect of property that I could do if capable of managing property except make my Will.</p>
                            <p>This document shall be considered to be a continuing power of Attorney for Property under the Act.</p>
                            <p>I revoke any previous Powers of Attorney for Property.</p>
                            <p>For clarity, my Attorney(s) have the following powers in addition to the general powers noted above, subject to
                                any conditions or restrictions contained herein.</p>
                            <ul>
                                <li>My Attorney shall have the authority to act as my litigation guardian if one is required to commence,
                                    defend, or represent me in any court proceedings.</li>
                                <li>To act as my representative for all purposes related to the Canada Revenue Agency and any dealings
                                    with any level of government.</li>
                            </ul>
                            <p>CONDITIONS AND RESTRICTIONS</p>
                            {
                                restrictions
                                    ? (
                                        <ol>
                                            <li>{restrictions}</li>
                                        </ol>
                                    )
                                    : <p>No conditions or restrictions upon Power of Attorney.</p>
                            }

                            <p>The authority granted to my Attorney under this Power of Attorney for Personal Property will be in effect if and
                                as long as I have been found by an Assessor to lack Capacity, or it is voluntarily revoked by me.</p>
                            <p>Unless otherwise stated in this document, I authorize my Attorney(s) to take annual compensation from my
                                property in accordance with the fee scale prescribed by regulation for the compensation of Attorneys for
                                Property made pursuant to Section 90 of the Act.</p>
                            <p>The remainder of this page has been intentionally left blank.</p>
                            <p>Signed by me under hand and seal in the city of {capitalLetters(personal.city)}, province of {capitalLetters(personal.province)}, this _____ day of
                                _____________, 20__, observed remotely by my witnesses via video conference.</p>
                            <p>__________________________________________________<br />
                                {capitalLetters(personal.fullName)}<br />
                                {personal.city},{personal.province ? `${personal.province}` : ""}<br />
                            </p>
                            <p>SIGNED AND DECLARED by {capitalLetters(personal.fullName)} on this ____ day of ____________________, 20____to be the
                                Grantor's Power of Attorney for Property, in our presence, remotely, who at the Grantor's request and in the
                                presence of the Grantor, via video conference and in the physical presence of each other at Vaughan,
                                Ontario, all being present at the same time, have signed our names as witnesses in the Grantor's presence
                                on the above date.</p>
                            <p>______________________________<br />
                                Signature of Witness #1 (Nicole Barrett)<br />
                                665 Millway Avenue, Unit 44<br />
                                Vaughan, Ontario<br />
                                L4K 3T8</p>
                            <p>______________________________<br />
                                Signature of Witness #2 (Dale Barrett)<br />
                                665 Millway Avenue, Unit 44<br />
                                Vaughan, Ontario<br />
                                L4K 3T8</p>
                        </div >
                    )
            }
        </div >
    );
});

export default POA1Content;