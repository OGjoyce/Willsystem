import React, { forwardRef } from 'react';
import './content.css';

const POA2Content = forwardRef((props, ref) => {
    const capitalLetters = (word) => {
        if (word == null) return null
        return word
    };

    if (!props || !props.props) {
        return null;
    }

    const datasObj = props.props.datas || [];
    const documentDOM = props.props.selectedDOMVersion;

    const statusObject = {};
    datasObj.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
            statusObject[key] = value;
        });
    });

    const personal = statusObject.personal || {};
    const spouseInfo = statusObject.married || {};
    const kids = Object.values(statusObject.kids || {});
    const relatives = Object.values(datasObj[5].relatives || {});
    const POAInfo = statusObject.poaHealth || {};
    console.log('re', relatives)
    // Function to find person information based on name
    function findPersonInfo(name, relatives, kids, spouseInfo) {
        if (!name) return { city: '', country: '', province: '', fullName: '', relation: '', telephone: '' };
        const names = name.trim();
        let person = relatives.find(rel => `${rel.firstName} ${rel.lastName}` === names);
        let relation = person ? person.relative : '';

        if (!person) {
            person = kids.find(kid => `${kid.firstName} ${kid.lastName}` === names);
            relation = person ? 'Child' : '';
        }

        if (!person && spouseInfo.firstName && spouseInfo.lastName && `${spouseInfo.firstName} ${spouseInfo.lastName}` === names) {
            person = spouseInfo;
            person.fullName = `${spouseInfo.firstName || ''} ${spouseInfo.middleName || ''} ${spouseInfo.lastName || ''}`.trim()
            relation = 'Spouse';
        }

        if (person) {
            if (person.middleName == undefined) { person.middleName = "" }
            return {
                city: person.city || '',
                country: person.country || '',
                province: person.province || '',
                fullName: `${person.firstName} ${person.middleName} ${person.lastName}`.trim() || '',
                relation: relation,
                telephone: person.phone || person.telephone || ''
            };
        }

        return { city: '', country: '', province: '', fullName: names, relation: '', telephone: '' };
    }
    console.log(POAInfo)
    const attorneyOne = POAInfo.poaHealth ? findPersonInfo(POAInfo.poaHealth.attorney, relatives, kids, spouseInfo) : {};
    const attorneyTwo = POAInfo.poaHealth && POAInfo.poaHealth.backups && POAInfo.poaHealth.backups.length > 0
        ? POAInfo.poaHealth.backups.map((backup) => findPersonInfo(backup, relatives, kids, spouseInfo))
        : [];

    const restrictions = POAInfo.poaHealth ? (POAInfo.poaHealth.restrictions || '') : '';
    console.log(POAInfo)
    const statements = POAInfo.poaHealth ? (POAInfo.statements || '') : {};
    console.log('statements', statements)

    console.log('two', attorneyTwo)
    return (

        <div ref={ref}>
            {documentDOM !== null
                ? <div dangerouslySetInnerHTML={{ __html: documentDOM }} />
                : (
                    <div className='document-container'>
                        <h2 className='document-header'>Power of Attorney for Personal Care of {personal.fullName}</h2>
                        <br />
                        <p><strong>POWER OF ATTORNEY FOR PERSONAL CARE OF {capitalLetters(personal.fullName)}</strong></p>
                        <p>
                            I, {capitalLetters(personal.fullName)} of {capitalLetters(personal.city)}{personal.province ? `, ${capitalLetters(personal.province)}` : ""}, being of sound mind and of legal age to execute this document, do hereby make this Power of Attorney for Personal Care. I fully understand the consequences of my actions in doing so. I intend this Power of Attorney for Personal Care to be read by my health care providers, family, and friends as a true reflection of my wishes and instructions should I lack capacity and be unable to communicate such wishes and instructions.
                        </p>
                        <p><strong>Definitions</strong></p>
                        <ol>
                            <li>
                                As used in this document:
                                <ul>
                                    <li><strong>"Act"</strong> means the Ontario Substitute Decisions Act.</li>
                                    <li><strong>"Assessor"</strong> means a person who is designated by the regulations to the Act as being qualified to
                                        do assessments of Capacity.</li>
                                    <li><strong>"Capacity"</strong> means the person is able to understand information that is relevant to making a
                                        decision concerning his or her own health care, nutrition, shelter, clothing, hygiene or safety, and
                                        is able to appreciate the reasonably foreseeable consequences of a decision or lack of decision.</li>
                                </ul>
                            </li>
                        </ol>
                        <p><strong>Revoke Previous Power of Attorney for Personal Care</strong></p>
                        <ol start="2">
                            <li>I revoke any previous Power of Attorney for Personal Care made by me.</li>
                        </ol>
                        <p><strong>Designation of Attorney</strong></p>
                        <ol start="3">
                            <li>
                                I designate  {attorneyOne.relation && ` my ${attorneyOne?.relation?.toLowerCase()}`} {capitalLetters(attorneyOne.fullName)}  {attorneyOne.city && attorneyOne.province && `, of ${capitalLetters(attorneyOne.city)}, ${capitalLetters(attorneyOne.province)}, ${capitalLetters(attorneyOne.country)}`} to be my sole Attorney for
                                Personal Care (my "Attorney").
                            </li>
                            {attorneyTwo && attorneyTwo.length > 0 && (
                                <li>
                                    If {attorneyOne.relation && `my ${attorneyOne?.relation?.toLowerCase()}`} {capitalLetters(attorneyOne.fullName)} cannot or will not be my Attorney because of refusal, resignation, death, mental incapacity, or removal by the court, I SUBSTITUTE {capitalLetters(attorneyTwo[0].fullName)} {attorneyTwo[0].city && `of ${capitalLetters(attorneyTwo[0].city)}`}, {attorneyTwo[0].province && `, ${capitalLetters(attorneyTwo[0].country)}`}  to be my sole Attorney.
                                </li>
                            )}

                            {attorneyTwo.slice(1).map((backup, index) => (
                                <li key={index}>
                                    If {capitalLetters(attorneyTwo[index].fullName)} cannot or will not be my Attorney because of refusal, resignation, death, mental incapacity, or removal by the court, I SUBSTITUTE {capitalLetters(backup.fullName)} {backup.city && `of ${capitalLetters(backup.city)}`}, {backup.province && `of ${capitalLetters(backup.province)},`} {backup.country && `${capitalLetters(backup.country)} `} to be my sole Attorney.
                                </li>
                            ))}

                        </ol>
                        <p><strong>Duties and Authority of Attorney</strong></p>
                        <ol start="5">
                            <li>
                                Where I do not have Capacity to make decisions for myself, I give my Attorney full authority to make
                                Personal Care decisions, major health care decisions, and minor health care decisions on my behalf.
                            </li>
                            <li>
                                Notwithstanding any instructions contained in this Power of Attorney for Personal Care, my Attorney
                                taking into consideration all my wishes may make a decision that conflicts with any of those instructions
                                and my Attorney's decision is binding notwithstanding any wishes of my family and friends.
                            </li>
                        </ol>
                        <p><strong>In Force</strong></p>
                        <ol start="7">
                            <li>
                                The authority granted to my Attorney under this Power of Attorney for Personal Care will be in effect
                                only if and as long as I have been found to lack Capacity, or it is voluntarily revoked by me.
                            </li>
                        </ol>
                        <p><strong>Determination of Capacity</strong></p>
                        <ol start="8">
                            <li>
                                A determination of lack of Capacity will be made by an Assessor who is qualified to do assessments of
                                Capacity as described in the regulations to the Act.
                            </li>
                        </ol>
                        <p><strong>Notification on Determination of Incapacity</strong></p>
                        <ol start="9">
                            <li>
                                If a determination is made that I lack Capacity under the Act to make personal decisions on my own
                                behalf then I instruct the person or persons making that determination to provide a written copy of that
                                declaration to me and to the Attorney I have designated in this Power of Attorney for Personal Care.
                            </li>
                        </ol>
                        <p><strong>Treatment Directions and End-Of-Life Decisions</strong></p>
                        <ol start="10">
                            <li>
                                Subject to any decision or direction of my Attorney to the contrary, I direct that my health care providers
                                and others involved in my care provide, withhold or withdraw treatment in accordance with my
                                directions below:
                                <ol type="a">
                                    <li>
                                        If I have an incurable and irreversible terminal condition that will result in my death, I direct that:
                                        <ul>
                                            <li>{statements?.terminalCondition?.noLifeSupport ? "I do not wish to be given life support." : "I wish to be given life support."}</li>
                                            <li>{statements?.terminalCondition?.noTubeFeeding ? "I do not wish to receive tube feeding." : "I wish to receive tube feeding."}</li>
                                            <li>{statements?.terminalCondition?.noActiveTreatment ? "I do not wish to receive active treatment for any other condition." : "I wish to receive active treatment for any other condition."}</li>
                                        </ul>
                                    </li>
                                    <li>
                                        If I am diagnosed as persistently unconscious and will not regain consciousness, I direct that:
                                        <ul>
                                            <li>{statements?.unconsciousCondition?.noLifeSupport ? "I do not wish to be kept on artificial life support." : "I wish to be kept on artificial life support."}</li>
                                            <li>{statements?.unconsciousCondition?.noTubeFeeding ? "I do not wish to receive tube feeding." : "I wish to receive tube feeding."}</li>
                                            <li>{statements?.unconsciousCondition?.noActiveTreatment ? "I do not wish to receive active treatment for any other condition." : "I wish to receive active treatment for any other condition."}</li>
                                        </ul>
                                    </li>
                                    <li>
                                        If I am diagnosed as being severely and permanently mentally impaired, I direct that:
                                        <ul>
                                            <li>{statements?.mentalImpairment?.noLifeSupport ? "I do not wish to be kept on artificial life support." : "I wish to be kept on artificial life support."}</li>
                                            <li>{statements?.mentalImpairment?.noTubeFeeding ? "I do not wish to receive tube feeding." : "I wish to receive tube feeding."}</li>
                                            <li>{statements?.mentalImpairment?.noActiveTreatment ? "I do not wish to receive active treatment for any other condition." : "I wish to receive active treatment for any other condition."}</li>
                                        </ul>
                                    </li>
                                    <li>
                                        If my behavior becomes violent or degrading, I direct that:
                                        <ul>
                                            <li>{statements?.violentBehavior?.useDrugs ? "I want my symptoms controlled with drugs, even if it worsens my condition." : "I do not want drugs to control my symptoms."}</li>
                                        </ul>
                                    </li>
                                    <li>
                                        If I appear to be in pain, I direct that:
                                        <ul>
                                            <li>{statements?.painManagement?.useDrugs ? "I want my pain controlled with drugs, even if it worsens my condition." : "I do not want drugs to control my pain."}</li>
                                        </ul>
                                    </li>
                                </ol>

                            </li>
                        </ol>
                        <p><strong>Revocation</strong></p>
                        <ol start="11">
                            <li>
                                The authority granted in this Power of Attorney for Personal Care may be revoked as and where
                                permitted by law.
                            </li>
                            <li>
                                I understand that, as long as I have Capacity, I may revoke this Power of Attorney for Personal Care at
                                any time.
                            </li>
                        </ol>
                        <p><strong>Delegation of Authority</strong></p>
                        <ol start="13">
                            <li>An Attorney cannot delegate his or her authority as Attorney.</li>
                        </ol>
                        <p><strong>Organ Donation</strong></p>
                        <ol start="14">
                            <li>
                                {POAInfo.organDonation ? "I wish for my organs and tissue to be used for transplantation upon my death." : "I do not wish for my organs and tissue to be used for transplantation upon my death."}
                            </li>
                        </ol>
                        <p><strong>Additional Instructions</strong></p>
                        <ol start="15">
                            <li>
                                I wish to be kept comfortable and free from pain. This means that I may be given pain medication even
                                though it may dull consciousness and indirectly shorten my life.
                            </li>
                            <li>
                                I direct that my Attorney shall be entitled to receive reimbursement for all reasonable expenses that
                                they incur in their capacity as my Attorney, from my assets.
                            </li>
                            {restrictions && (
                                <li>
                                    Additional restrictions or instructions: {restrictions}
                                </li>
                            )}
                            {POAInfo.dnr && (
                                <li>
                                    I have a Do Not Resuscitate (DNR) order in place.
                                </li>
                            )}
                        </ol>
                        <p><strong>Liability of Attorney</strong></p>
                        <ol start="17">
                            <li>
                                An Attorney will not be liable for any mistake or error in judgment or for any act or omission believed to
                                be made in good faith and believed to be within the scope of authority conferred or implied by this
                                Power of Attorney for Personal Care and by the Act.
                            </li>
                            <li>
                                Without limiting the liability of the Attorney, the Attorney will be liable for any and all acts and omissions
                                involving intentional wrongdoing.
                            </li>
                        </ol>
                        <p><strong>General</strong></p>
                        <ol start="19">
                            <li>A copy of this Power of Attorney for Personal Care has the same effect as the original.</li>
                            <li>
                                If any part or parts of this Power of Attorney for Personal Care is found to be invalid or illegal under
                                applicable law by a court of competent jurisdiction, the invalidity or illegality of that part or parts will not
                                in any way affect the remaining parts and this document will be construed as though the invalid or
                                illegal part or parts had never been included in this Power of Attorney for Personal Care. But if the
                                intent of this Power of Attorney for Personal Care would be substantially changed by such construction,
                                then it shall not be so construed.
                            </li>
                            <li>This Power of Attorney for Personal Care is intended to be governed by the laws of the Province of
                                Ontario.</li>
                        </ol>
                        <p>The remainder of this page has been intentionally left blank.</p>
                        <p><strong>Signed</strong></p>
                        <p>
                            Signed by me under hand and seal in the city of {personal.city}, province of {personal.province}, this _____ day of
                            _______________, 20__, observed remotely by my witnesses via video conference.
                        </p>
                        <p>__________________________________________________</p>
                        <p>{capitalLetters(personal.fullName)}</p>
                        <p>{capitalLetters(personal.city)} {personal.province ? `, ${capitalLetters(personal.province)}` : ''}</p>
                        <p>
                            SIGNED AND DECLARED by {capitalLetters(personal.fullName)} on this ____ day of ____________________, 20____ to
                            be the Grantor's Power of Attorney for Personal Care, in our presence, remotely, who at the Grantor's
                            request and in the presence of the Grantor, via video conference and in the physical presence of each
                            other at Vaughan, Ontario, all being present at the same time, have signed our names as witnesses in
                            the Grantor's presence on the above date.
                        </p>
                        <p>______________________________</p>
                        <p>Signature of Witness #1 (Nicole Barrett)</p>
                        <p>665 Millway Avenue, Unit 44</p>
                        <p>Vaughan, Ontario</p>
                        <p>L4K 3T8</p>
                        <p>______________________________</p>
                        <p>Signature of Witness #2 (Dale Barrett)</p>
                        <p>665 Millway Avenue, Unit 44</p>
                        <p>Vaughan, Ontario</p>
                        <p>L4K 3T8</p>
                        <p><strong>Attorney Acknowledgment</strong></p>
                        <p>(Each Attorney should sign or acknowledge the Power of Attorney for Personal Care)</p>
                        <p>________________________________ (Sign)</p>
                        <p>{capitalLetters(attorneyOne.fullName)}</p>
                        <p>{capitalLetters(attorneyOne.city)}, {capitalLetters(attorneyOne.province)}</p>
                        <p>Date:______________________________</p>
                        <br></br>
                        <p>________________________________ (Sign)</p>
                        <p>{capitalLetters(attorneyTwo.fullName)}</p>
                        <p>{capitalLetters(attorneyTwo.city)}, {capitalLetters(attorneyTwo.province)}</p>
                        <p>Date:______________________________</p>
                        <p><strong>Record of Copies</strong></p>
                        <p>Record of people and institutions to whom I have given a copy of this Personal Directive:</p>
                        <ol>
                            <li>______________________ Date: _______________</li>
                            <li>______________________ Date: _______________</li>
                            <li>______________________ Date: _______________</li>
                            <li>______________________ Date: _______________</li>
                            <li>______________________ Date: _______________</li>
                            <li>______________________ Date: _______________</li>
                        </ol>
                    </div>
                )
            }
        </div>
    );
});

export default POA2Content;
