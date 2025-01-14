import React, { forwardRef } from 'react';
import './content.css'

var WillContent = forwardRef((props, ref) => {
    const capitalLetters = (word) => {
        if (word == null) return null
        return word.toUpperCase();
    };


    if (props != undefined) {

        var datasObj = props.props.datas;
        var documentDOM = props.props.selectedDOMVersion
        var documentType = props.props.documentType
        var willType = documentType == "primaryWill" ? "PRIMARY" : documentType == "spousalWill" ? "SPOUSAL" : documentType == "secondaryWill" ? "SECONDARY " : ""

        var statusObject = {};
        datasObj.forEach(item => {
            Object.entries(item).forEach(([key, value]) => {
                statusObject[key] = value;
            });
        });
        var personal = statusObject.personal;
        var isMarried = statusObject.marriedq.selection === "true";
        var isCommonRelationship = statusObject.marriedq.selection === "soso"
        var spouseInfo = statusObject.married;
        var hasKids = statusObject.kidsq.selection === "true";
        var kids = Object.values(statusObject.kids);
        var relatives = datasObj[5]?.relatives || [];
        var executors = statusObject.executors ? Object.values(statusObject.executors) : [];
        var bequests = statusObject.bequests ? Object.values(statusObject.bequests).filter(item => typeof item === 'object') : [];
        var trusting = statusObject.trusting ? Object.values(statusObject.trusting).filter(item => typeof item === 'object') : [];
        var pets = statusObject.pets ? Object.values(statusObject.pets).filter(item => typeof item === 'object') : [];
        var guardians = statusObject.guardians ? Object.values(statusObject.guardians).filter(item => typeof item === 'object').sort((a, b) => a.position - b.position) : [];
        var minTrustingAge = trusting.length > 0
            ? trusting.map(trust => trust.age).reduce((prevValue, currentValue) => prevValue > currentValue ? currentValue : prevValue)
            : null
        var wipeoutInfo = datasObj[9]?.wipeout.wipeout || [];

        var residueInfo = statusObject.residue;
        var additionalInfo = statusObject.additional;

        var POAInfo = statusObject.poa;



    }

    function findPersonInfo(name, relatives, kids, spouseInfo) {
        const names = name.trim();
        const person =
            relatives.find(rel => `${rel.firstName} ${rel.lastName}` === names || `${rel.firstName} ${rel.middleName}` === names) ||
            kids.find(kid => `${kid.firstName} ${kid.lastName}` === names) ||
            (spouseInfo.firstName && spouseInfo.lastName && `${spouseInfo.firstName} ${spouseInfo.lastName}` === names ? spouseInfo : null);

        if (person) {
            return {
                city: person.city || '',
                country: person.country || '',
                province: person.province || '',
                fullName: `${person.firstName} ${person.lastName}`.trim() || ''
            };
        }

        return { city: '', country: '', province: '', fullName: names };
    }



    return (
        <div ref={ref}>
            {
                documentDOM !== null
                    ? <div dangerouslySetInnerHTML={{ __html: documentDOM }} />
                    : (
                        <div className='document-container'>
                            <p class="align-center"><strong>{willType} LAST WILL AND TESTAMENT OF {capitalLetters(personal.fullName)} </strong></p>
                            <p><br /><br />I, {capitalLetters(personal.fullName)}, presently of {capitalLetters(personal.city)} {personal.province ? `, ${capitalLetters(personal.province)}` : ''} declare that this is my Last Will and Testament.<br /><br /></p>

                            <p><strong><u>Prior Wills and Codicils</u></strong></p>
                            <ol>

                                <li>I revoke all prior Wills and Codicils.</li>
                            </ol>
                            <p><strong><u>Marital Status</u></strong></p>
                            <ol>
                                <li>
                                    {isMarried
                                        ? `I am married to ${capitalLetters(spouseInfo.firstName)} ${capitalLetters(spouseInfo.middleName)} ${capitalLetters(spouseInfo.lastName)} (my "${spouseInfo.relative}").`
                                        : isCommonRelationship
                                            ? `I am in a common law relationship with ${capitalLetters(spouseInfo.firstName)} ${capitalLetters(spouseInfo.lastName)} (my "${spouseInfo.relative}").`
                                            : "I am not married or in a common law relationship."
                                    }
                                </li>
                            </ol>
                            <p><strong><u>Current Children</u></strong></p>
                            <ol>
                                {hasKids ? (
                                    <>
                                        <li>I have the following living children: </li>

                                        <ul>

                                            {kids.map((kid, index) => (
                                                <li key={index}>{`${capitalLetters(kid.firstName)} ${capitalLetters(kid.lastName)}`}</li>
                                            ))}

                                        </ul>

                                        <li>The term "child" or "children" as used in this my Will includes the above listed children and any children of mine that are subsequently born or legally adopted.</li>
                                    </>

                                ) : (
                                    <li>I do not currently have any living children</li>
                                )}

                            </ol>
                            <br></br>
                            <p class="align-center"><strong>II. EXECUTOR</strong></p><p><strong><u>Definition</u></strong></p>
                            <ol>
                                <li>The expression "my Executor" used throughout this Will includes either the singular or plural number,
                                    wherever the fact or context so requires. The term "executor" in this Will is synonymous with and includes
                                    the terms "personal representative" and "executrix".
                                </li>
                            </ol>
                            <p><strong><u>Appointment</u></strong></p>
                            <ol>
                                {executors.length > 0 && executors.map((executor, index) => (
                                    <li key={index}>
                                        {index === 0 ? "I appoint " : `If ${capitalLetters(executors[index - 1].firstName)} ${capitalLetters(executors[index - 1].lastName)} should refuse or be unable to act or continue to act as my Executor, then I appoint `}
                                        {capitalLetters(executor.firstName)} {capitalLetters(executor.lastName)} of {capitalLetters(executor.city)}, {capitalLetters(executor.province)}
                                        {index === 0 ? " as the sole Executor of this my Will." : " to be the sole Executor of this my Will."}
                                    </li>
                                ))}
                                {!executors.length > 0 &&

                                    <li>
                                        I appoint Lawyers and Lattes Professional Corporation or any successor law firm as the sole Executor of this my Will.
                                    </li>
                                }
                                <li>No bond or other security of any kind will be required of any Executor appointed in this my Will.</li>
                            </ol>
                            <p><strong><u>Powers of my Executor</u></strong></p>
                            <ol>
                                <li>I give and appoint to my Executor the following duties and powers with respect to my estate:</li>
                                <ul>
                                    <li>
                                        My Executor(s) shall collect and gather my assets and may sell these assets at a time and price and upon
                                        such other terms as they consider appropriate in their absolute discretion, and without liability for
                                        loss or depreciation;
                                    </li>
                                    <li>
                                        To pay my legally enforceable debts, funeral expenses and all expenses in connection with the
                                        administration of my estate and the trusts created by my Will as soon as convenient after my death. If
                                        any of the real property devised in my Will remains subject to a mortgage at the time of my death, then
                                        I direct that the devisee taking that mortgaged property will take the property subject to that mortgage
                                        and that the devisee will not be entitled to have the mortgage paid out or resolved from the remaining
                                        assets of the residue of my estate;
                                    </li>
                                    <li>
                                        To take all legal actions to have the probate of my Will completed as quickly and simply as possible,
                                        and as free as possible from any court supervision, under the laws of the Province of Ontario;
                                    </li>
                                    <li>
                                        To retain, exchange, insure, repair, improve, sell or dispose of any and all personal property belonging
                                        to my estate as my Executor deems advisable without liability for loss or depreciation;
                                    </li>
                                    <li>
                                        To invest, manage, lease, rent, exchange, mortgage, sell, dispose of or give options without being
                                        limited as to term and to insure, repair, improve, or add to or otherwise deal with any and all real
                                        property belonging to my estate as my Executor deems advisable without liability for loss or
                                        depreciation;
                                    </li>
                                    <li>
                                        To purchase, maintain, convert and liquidate investments or securities, and to vote stock, or exercise
                                        any option concerning any investments or securities without liability for loss;
                                    </li>
                                    <li>To open or close bank accounts;</li>
                                    <li>
                                        To maintain, continue, dissolve, change or sell any business which is part of my estate, or to purchase
                                        any business if deemed necessary or beneficial to my estate by my Executor;
                                    </li>
                                    <li>To maintain, settle, abandon, sue or defend, or otherwise deal with any lawsuits against my estate;</li>
                                    <li>To open, liquidate or dissolve a corporation;</li>
                                    <li>To conduct post-mortem tax planning;</li>
                                    <li>To employ any lawyer, accountant or other professional; and</li>
                                    {trusting.length > 0 && (
                                        <li>
                                            Except as otherwise provided in this my Will, to act as my Trustee by holding in trust the share of any
                                            beneficiary for whom a Testamentary Trust is established pursuant to this Will, and to keep such share
                                            invested, pay the income or capital or as much of either or both as my Executor considers advisable for
                                            the maintenance, education, advancement or benefit of such beneficiary and to pay or transfer the
                                            capital of such share or the amount remaining of that share to such beneficiary reaching the age of {minTrustingAge} years
                                            or, prior to such beneficiary when they reach the age of {minTrustingAge} years, to pay or transfer such share to
                                            any parent or guardian of such beneficiary subject to like conditions and the receipt of any such parent or
                                            guardian discharges my Executor
                                        </li>
                                    )}
                                    <li>
                                        When my Executor administers my estate, my Executor may convert my estate or any part of my estate into
                                        money or any other form of property or security, and decide how, when, and on what terms. My Executor
                                        may keep my estate, or any part of it, in the form it is in at my death and for as long as my Executor
                                        decides, even for the duration of the trusts in this Will. This power applies even if the property is
                                        not an investment authorized under this Will, a debt is owing on the property; or the property does not
                                        produce income.
                                    </li>
                                </ul>
                                <li value="2">
                                    The above authority and powers granted to my Executor are in addition to any powers and elective rights
                                    conferred by provincial/territorial or federal law or by other provision of this Will and may be exercised
                                    as often as required, and without application to or approval by any court.
                                </li>
                            </ol>
                            <br></br>
                            <p class="align-center"><strong>III. DISPOSITION OF ESTATE</strong></p>
                            {bequests && bequests.length > 0 && <>
                                <p><strong><u>Bequests</u></strong></p>
                                <ol>

                                    <>
                                        <li>
                                            To receive a specific bequest under this Will a beneficiary must survive me for thirty days. Any item that
                                            fails to pass to a beneficiary will return to my estate to be included in the residue of my estate. All
                                            property given under this Will is subject to any encumbrances or liens attached to the property. My specific
                                            bequests are as follows:
                                        </li>
                                        <ul>
                                            {bequests.map((item, index) => {
                                                const { city, country } = findPersonInfo(item.names, relatives, kids, spouseInfo);
                                                return !item.isCustom
                                                    ? (
                                                        <li key={index}>
                                                            I leave {item.shares}% of {item.bequest} to {capitalLetters(item.names)} of {capitalLetters(city)}, {capitalLetters(country)} if they shall survive me, for their own use absolutely.
                                                        </li>
                                                    )
                                                    : null
                                            })}

                                            {bequests.map((item, index) => {
                                                const { city, country } = findPersonInfo(item.names, relatives, kids, spouseInfo);
                                                return item.isCustom
                                                    ? (
                                                        <li key={index}>
                                                            {item.bequest}, if they shall survive me, for their own use absolutely.
                                                        </li>
                                                    )
                                                    : null
                                            })}
                                        </ul>
                                    </>

                                </ol>
                            </>}


                            <p><strong><u>Distribution of Residue</u></strong></p>
                            <p>Last Will and Testament of {capitalLetters(personal.fullName)}</p>
                            <ol>
                                <li>To receive any gift or property under this Will a beneficiary must survive me for thirty days.</li>
                                <li>Beneficiaries or any alternate beneficiaries of my estate residue will receive and share all of my property
                                    and assets not specifically bequeathed or otherwise required for the payment of any debts owed, including
                                    but not limited to, expenses associated with the probate of my Will, the payment of taxes, funeral expenses
                                    or any other expense resulting from the administration of my Will.
                                </li>
                                <li>The entire estate residue is to be divided between my designated beneficiaries or any alternate beneficiaries with the beneficiaries or any alternate beneficiaries receiving a part of the entire estate residue.</li>


                                {/* Condicional para "Specific Beneficiaries" */}
                                {statusObject.residue.selected === "Specific Beneficiaries" && (
                                    <>
                                        <li>The entire estate residue is to be divided between my designated beneficiaries or any alternate beneficiaries as follows:</li>
                                        <ul>
                                            {statusObject.residue.beneficiary.map((beneficiary, index) => {
                                                const { city, country } = findPersonInfo(beneficiary.beneficiary, relatives, kids, spouseInfo);
                                                const { city: backupCity, country: backupCountry } = findPersonInfo(beneficiary.backup, relatives, kids, spouseInfo)

                                                return (

                                                    <li key={index}>
                                                        {beneficiary.isOrganization ? (
                                                            <>

                                                                Organization: {beneficiary.beneficiary} - {beneficiary.shares}% share
                                                            </>
                                                        ) : (
                                                            <>
                                                                Beneficiary: {beneficiary.beneficiary}
                                                                {city ? ` of ${capitalLetters(city)}, ${capitalLetters(country)}` : ''}
                                                                - {beneficiary.shares}% share
                                                                {beneficiary.backup && beneficiary.backup !== 'NA' ? (
                                                                    <>, if {beneficiary.beneficiary} predeceases me, then I give the residue of my estate to {beneficiary.backup}
                                                                        {backupCity ? ` of ${capitalLetters(backupCity)}, ${capitalLetters(backupCountry)}` : ''}
                                                                        {beneficiary.type ? `, Type: ${beneficiary.type}` : ''}
                                                                    </>
                                                                ) : (
                                                                    beneficiary.type ? `, Type: ${beneficiary.type}` : ''
                                                                )}
                                                            </>


                                                        )}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                        <li>All property given under this Will is subject to any encumbrances or liens attached to the property.</li>
                                    </>
                                )}

                                {/* Condicional para "Custom Clause" */}
                                {statusObject.residue.selected === "Custom Clause" && (
                                    <>
                                        <li>The residue of my estate shall be distributed in accordance with the following custom clause:</li>
                                        <blockquote>"{statusObject.residue.clause}"</blockquote>
                                        <li>All property given under this Will is subject to any encumbrances or liens attached to the property.</li>
                                    </>
                                )}

                                {/* Condicional para "Bloodline Selection" */}
                                {statusObject.residue.selected === "Have the residue go to parents then siblings per stirpes" && (
                                    <>
                                        <li>The residue of my estate shall go to my parents, and if they predecease me, to my siblings per stirpes, ensuring each line of descent receives an equal portion.</li>
                                        <li>If any of my siblings predecease me, their share shall be divided equally among their surviving descendants.</li>
                                        <li>All property given under this Will is subject to any encumbrances or liens attached to the property.</li>
                                    </>
                                )}

                                {statusObject.residue.selected === "Have the residue go to siblings per stirpes" && (
                                    <>
                                        <li>The residue of my estate shall be distributed to my siblings per stirpes, with each line of descent receiving an equal share.</li>
                                        <li>If any of my siblings predecease me, their share shall be divided among their surviving descendants in equal portions.</li>
                                        <li>All property given under this Will is subject to any encumbrances or liens attached to the property.</li>
                                    </>
                                )}

                                {statusObject.residue.selected === "Have the residue go to children per stirpes" && (
                                    <>
                                        <li>The residue of my estate shall be distributed among my children per stirpes, where each line of descent receives an equal portion of the estate.</li>
                                        <li>If any of my children predecease me, their share shall be passed equally to their surviving descendants.</li>
                                        <li>All property given under this Will is subject to any encumbrances or liens attached to the property.</li>
                                    </>
                                )}

                                {statusObject.residue.selected === "Have the residue go to children per capita" && (
                                    <>
                                        <li>The residue of my estate shall be distributed among my children per capita, with each child receiving an equal share.</li>
                                        <li>If any of my children predecease me, their portion shall be equally divided among the surviving children.</li>
                                        <li>All property given under this Will is subject to any encumbrances or liens attached to the property.</li>
                                    </>
                                )}
                            </ol>



                            <p><strong><u>Wipeout Provision</u></strong></p>
                            <ol>
                                <li>Should all my named beneficiaries and alternate beneficiaries predecease me or fail to survive me for thirty
                                    full days, or should they all die before becoming entitled to receive the whole of their share of my estate,
                                    then I direct my Executor to divide any remaining residue of my estate into equal shares as outlined below
                                    and to pay and transfer such shares to the following wipeout beneficiaries:
                                </li>

                                <ul>
                                    {/* Caso para custom wipeout provision con beneficiarios en table_dataBequest */}
                                    {Array.isArray(wipeoutInfo.table_dataBequest) && wipeoutInfo.table_dataBequest.length > 0 ? (
                                        wipeoutInfo.table_dataBequest.map((beneficiary, index) => {
                                            const { city, country, fullName } = findPersonInfo(beneficiary.beneficiary, relatives, kids, spouseInfo);
                                            const { city: backupCity, country: backupCountry } = findPersonInfo(beneficiary.backup, relatives, kids, spouseInfo);

                                            return (
                                                <li key={index}>
                                                    I leave {beneficiary.shares} shares of the residue of my estate to {capitalLetters(beneficiary.beneficiary)} {city ? `of ${capitalLetters(city)}, ${capitalLetters(country)}` : ''} if they shall survive me,
                                                    for their own use absolutely. {beneficiary.backup !== "N/A" && (
                                                        <>
                                                            If {capitalLetters(beneficiary.beneficiary)} should not survive me for thirty full days, or die
                                                            before becoming entitled to receive the whole of their share of the residue of my estate, I leave
                                                            this share of the residue to {capitalLetters(beneficiary.backup)}
                                                            {backupCity ? ` of ${capitalLetters(backupCity)}, ${capitalLetters(backupCountry)}` : ''}
                                                            {beneficiary.type !== "N/A" && `, Type: ${beneficiary.type}`} for their own use absolutely.
                                                        </>
                                                    )}

                                                </li>
                                            );
                                        })
                                    ) : (
                                        // Caso para categorías de wipeout simples como "100% to parents and siblings"
                                        <li>
                                            {wipeoutInfo.selectedCategory === "100% to parents and siblings" && (
                                                <>
                                                    In the absence of surviving beneficiaries or alternate beneficiaries, I direct that 100% of the residue of my estate
                                                    shall be distributed to my parents, and if they are no longer living, then to my siblings in equal shares.
                                                </>
                                            )}
                                            {wipeoutInfo.selectedCategory === "100% to siblings" && (
                                                <>
                                                    In the absence of surviving beneficiaries or alternate beneficiaries, I direct that 100% of the residue of my estate
                                                    shall be distributed to my siblings in equal shares.
                                                </>
                                            )}
                                            {wipeoutInfo.selectedCategory === "50% to parents and siblings and 50% to parents and siblings of spouse" && (
                                                <>
                                                    In the absence of surviving beneficiaries or alternate beneficiaries, I direct that 50% of the residue of my estate
                                                    shall be distributed to my parents and siblings in equal shares, and 50% shall be distributed to the parents and
                                                    siblings of my spouse in equal shares.
                                                </>
                                            )}
                                            {wipeoutInfo.selectedCategory === "50% to siblings and 50% to siblings of spouse" && (
                                                <>
                                                    In the absence of surviving beneficiaries or alternate beneficiaries, I direct that 50% of the residue of my estate
                                                    shall be distributed to my siblings in equal shares, and 50% shall be distributed to the siblings of my spouse
                                                    in equal shares.
                                                </>
                                            )}
                                            {wipeoutInfo.custom && wipeoutInfo.table_dataBequest.length === 0 && (
                                                <>
                                                    No specific distribution instructions have been provided for the wipeout provision, and custom settings are enabled.
                                                </>
                                            )}
                                        </li>

                                    )}
                                </ul>
                            </ol>

                            {hasKids && guardians.length > 0 && (
                                <>
                                    <br></br>
                                    <p class="align-center"><strong>IV. CHILDREN</strong></p>
                                    <p><strong><u>Guardian for Minor and Dependent Children</u></strong></p>
                                    <ol>
                                        {guardians
                                            .sort((a, b) => parseInt(a.position) - parseInt(b.position))
                                            .map((guardian, index) => (
                                                <React.Fragment key={guardian.id}>
                                                    {index === 0 && (
                                                        <li>
                                                            Should my minor or dependent children require a guardian to care for them, I appoint the following individual to
                                                            be their guardian (the 'Guardian')
                                                        </li>
                                                    )}
                                                    <li>
                                                        {index === 0 ? (
                                                            <>
                                                                I appoint {capitalLetters(guardian.guardian)} to be the sole Guardian of all my minor and dependent children until they are
                                                                at least the age of majority.
                                                            </>
                                                        ) : (
                                                            <>
                                                                If {capitalLetters(guardians[index - 1].guardian)} should refuse or be unable to act or to continue to act as the Guardian and my minor
                                                                or dependent children require a guardian to care for them, then I appoint {capitalLetters(guardian.guardian)} to be
                                                                the sole Guardian of all my minor and dependent children until they are at least the age of majority.
                                                            </>
                                                        )}
                                                    </li>
                                                </React.Fragment>
                                            ))
                                        }
                                    </ol>

                                    <p><strong><u>RESP and RDSP</u></strong></p>
                                    <ol>
                                        <li>
                                            My Executor(s) shall appoint, as Successor Subscriber, a parent of the beneficiary(ies), Guardian for Property
                                            of the beneficiary(ies), person standing in the place of a parent of the beneficiary(ies) or to any other
                                            person, including the beneficiary(ies), which my Executor(s), in their sole discretion, considers to be a proper
                                            Successor Subscriber.
                                        </li>
                                        <li>
                                            The appointment by my Executor of a Successor Subscriber shall constitute a full and sufficient release to my
                                            Executor who shall not be obliged to see to the maintenance of the RESP and/or RDSP.
                                        </li>
                                        <li>
                                            Without limiting the foregoing, it is my wish that such Successor Subscriber shall take such steps as are
                                            necessary in order for the RESP to be maintained by them as the Successor Subscriber until such time as the
                                            beneficiary(ies) of the said RESP and/or RDSP qualify or may qualify for educational assistance payments (as
                                            such term is defined in the Income Tax Act).
                                        </li>
                                    </ol>
                                </>
                            )}

                            <br />
                            <p class="align-center"><strong>V. TESTAMENTARY TRUSTS</strong></p>
                            <p><strong><u>Testamentary Trust for Young Beneficiaries</u></strong></p>

                            <ol>

                                {trusting && Object.keys(trusting).length > 1 ? (
                                    <>
                                        It is my intent to create a testamentary trust (a "Testamentary Trust") for each beneficiary who has not yet
                                        reached the age of {minTrustingAge} at the time of my death (a "Young Beneficiary"). I name my Executor(s) as trustee (the
                                        "Trustee") of any and all Testamentary Trusts required in this my Will. Any assets bequeathed, transferred, or
                                        gifted to a Young Beneficiary are to be held in a separate trust by the Trustee until that Young Beneficiary
                                        reaches the designated age. Any property left by me to any Young Beneficiary in this my Will shall be given to
                                        my Executor(s) to be managed until that Young Beneficiary reaches the following ages, at which time they will
                                        receive that designated percentage of their inheritance:
                                        <ul>
                                            {Object.entries(trusting)
                                                .filter(([key, value]) => typeof value === 'object' && 'age' in value && 'shares' in value)
                                                .sort((a, b) => parseInt(a[1].age) - parseInt(b[1].age))
                                                .map(([key, item], index, array) => (
                                                    <li key={key}>
                                                        When they reach the age of {item.age} years, {item.shares}% of the total share will be paid or transferred to the beneficiary.
                                                    </li>
                                                ))}
                                        </ul>
                                        <li>
                                            At the age of {Math.max(...Object.values(trusting).filter(item => typeof item === 'object' && 'age' in item).map(item => parseInt(item.age)))} each beneficiary will receive their last payment, plus any other amounts then still remaining in trust for them.

                                            If prior to reaching these ages, the share may be paid or transferred to any parent or guardian of such beneficiary subject to like conditions and the receipt of any such parent or guardian discharges my Executor.
                                        </li>
                                    </>
                                ) : (
                                    <li>
                                        No young beneficiary trusting conditions added to Will
                                    </li>
                                )}

                            </ol>

                            <p><strong><u>Testamentary Trust for Disabled Beneficiaries</u></strong></p>
                            <ol>
                                <li>It is my intent to create a testamentary trust (a "Testamentary Trust") for each beneficiary who is temporarily
                                    or permanently disabled at the time of my death (a "Disabled Beneficiary"). Any assets bequeathed, transferred,
                                    or gifted to a Disabled Beneficiary are to be held in a separate trust by the Trustee until that Disabled
                                    Beneficiary regains the capacity to manage property (in the case of a temporary incapacity) or on a permanent
                                    basis if the incapacity is permanent. The property shall be managed, invested, or transferred to a Henson Trust
                                    at the absolute discretion of my Executor(s).</li>
                            </ol>


                            <p><strong><u>Trust Administration</u></strong></p>

                            <ol>
                                <li>The Trustee shall manage the Testamentary Trust for Young Beneficiaries as follows:</li>
                                {minTrustingAge
                                    ? (
                                        <ul>
                                            <li>The assets and property will be managed for the benefit of the Young Beneficiary until the beneficiary
                                                reaches the age set by me for final distribution;</li>
                                            <li>Upon the Young Beneficiary reaching the age set by me for final distribution, all property and assets
                                                remaining in the trust will be transferred to the beneficiary as quickly as possible; and</li>
                                            <li>Until the Young Beneficiary reaches the age set by me for final distribution, my Trustee will keep the
                                                assets of the trust invested and pay the whole or such part of the net income derived therefrom and any
                                                amount or amounts out of the capital that my Trustee may deem advisable to or for the support, health,
                                                maintenance, education, or benefit of that beneficiary.</li>
                                        </ul>
                                    )
                                    : (null)
                                }
                                <ul>
                                    <li>The Trustee may, in the Trustee's discretion, invest and reinvest trust funds in any kind of real or personal
                                        property and any kind of investment, provided that the Trustee acts with the care, skill, prudence and
                                        diligence, considering all financial and economic considerations, that a prudent person acting in a similar
                                        capacity and familiar with such matters would use.</li>
                                    <li>No bond or other security of any kind will be required of any Trustee appointed in this my Will.</li>
                                </ul>
                            </ol>


                            <p><strong><u>Trust Termination</u></strong></p>

                            <ol>
                                <li>The Testamentary Trust will end after any of the following:</li>

                                <ul>
                                    {minTrustingAge ? <li>The beneficiary reaching the age set by me for final distribution;</li> : null}
                                    <li>The beneficiary dies; or</li>
                                    <li>The assets of the trust are exhausted through distributions.</li>
                                </ul>

                            </ol>
                            <strong><u>Powers of Trustee</u></strong>
                            <ol>

                                <li>To carry out the terms of my Will, I give my Trustee the following powers to be used in his or her discretion at
                                    any time in the management of a trust created hereunder, namely:</li>

                                <ol>
                                    <li>The power to make such expenditures as are necessary to carry out the purpose of the trust;</li>
                                    <li>Subject to my express direction to the contrary, the power to sell, call in and convert into money any
                                        trust property, including real property, that my Trustee in his or her discretion deems advisable;</li>
                                    <li>Subject to my express direction to the contrary, the power to mortgage trust property where my Trustee
                                        considers it advisable to do so;</li>
                                    <li>Subject to my express direction to the contrary, the power to borrow money where my Trustee considers it
                                        advisable to do so;</li>
                                    <li>Subject to my express direction to the contrary, the power to lend money to the trust beneficiary if my
                                        Trustee considers it is in the best interest of the beneficiary to do so;</li>
                                    <li>To make expenditures for the purpose of repairing, improving and rebuilding any property;</li>
                                    <li>To exercise all rights and options of an owner of any securities held in trust;</li>
                                    <li>To lease trust property, including real estate, without being limited as to term;</li>
                                    <li>To make investments they consider advisable, without being limited to those investments authorized by
                                        law for trustees;</li>
                                    <li>To receive additional property from any source and in any form of ownership;</li>
                                    <li>Instead of acting personally, to employ and pay any other person or persons, including a body corporate,
                                        to transact any business or to do any act of any nature in relation to a trust created under my Will
                                        including the receipt and payment of money, without being liable for any loss incurred. And I authorize
                                        my Trustee to appoint from time to time upon such terms as they may think fit any person or persons,
                                        including a body corporate, for the purpose of exercising any powers herein expressly or impliedly given
                                        to my Trustee with respect to any property belonging to the trust;</li>
                                    <li>Without the consent of any persons interested in trusts established hereunder, to compromise, settle or
                                        waive any claim or claims at any time due to or by the trust in such manner and to such extent as my
                                        Trustee considers to be in the best interest of the trust beneficiary, and to make an agreement with any
                                        other person, persons or corporation in respect thereof, which shall be binding upon such beneficiary;
                                    </li>
                                    <li>To make or not make any election, determination, designation or allocation required or permitted to be
                                        made by my Trustee (either alone or jointly with others) under any of the provisions of any municipal,
                                        provincial/territorial, federal, or other taxing statute, in such manner as my Trustee, in his or her
                                        absolute discretion, deems advisable, and each such election, determination, designation or allocation
                                        when so made shall be final and binding upon all persons concerned;</li>
                                    <li>To pay himself or herself compensation as set out in the Trustee Act, R.S.O. 1990, c. T.23, out of the
                                        trust assets; and</li>
                                    <li>To employ and rely on the advice given by any attorney, accountant, investment advisor, or other agent
                                        to assist the Trustee in the administration of this trust and to compensate them from the trust assets.
                                    </li>
                                </ol>



                                <li>The above authority and powers granted to my Trustee are in addition to any powers and elective rights conferred
                                    by statute or federal law or by other provision of this Will and may be exercised as often as required, and
                                    without application to or approval by any court.</li>
                            </ol>
                            <p><strong><u>Other Trust Provisions</u></strong></p>
                            <ol>
                                <li>The expression "my Trustee" used throughout this Will includes either the singular or plural number, as
                                    appropriate wherever the fact or context so requires.</li>
                                <li>Subject to the terms of this my Will, I direct that my Trustee will not be liable for any loss to my estate or
                                    to any beneficiary resulting from the exercise by him or her in good faith of any discretion given him or her in
                                    this my Will;</li>
                                <li>Any trust created in this Will shall be administered as independently of court supervision as possible under the
                                    laws of the Province / Territory having jurisdiction over the trust; and</li>
                                <li>If any trust condition is held invalid, it will not affect other provisions that can be given effect without the
                                    invalid provision.</li>
                            </ol>
                            <br></br>
                            <p class="align-center"><strong>VI. DIGITAL ASSETS</strong></p>
                            <ol>
                                <li>My Executor(s) may access, handle, distribute, and dispose of my digital assets, and may obtain, access, modify,
                                    delete, and control my passwords and other electronic credentials associated with my digital devices and digital
                                    assets.</li>
                                <li>My Executor(s) may engage contractors or agents to assist my Executor(s) in accessing, handling, distributing,
                                    and disposing of my digital assets.</li>
                                <li>If I have prepared a memorandum, which may be altered by me from time to time, with instructions concerning my
                                    digital assets and their access, handling, distribution, and disposition, it is my wish that my Executor(s) and
                                    beneficiaries follow my instructions as outlined in that memorandum.</li>
                                <li>For the purpose of my Will, &ldquo;digital assets&rdquo; includes the following: Files stored on my digital
                                    devices, including but not limited to, desktops, laptops, tablets, peripherals, storage devices, mobile
                                    telephones, smartphones, and any similar digital device as well as emails, email accounts, digital music,
                                    digital photographs, digital videos, software licenses, social network accounts, file sharing accounts,
                                    financial accounts, banking accounts, domain registrations, DNS service accounts, web hosting accounts, tax
                                    items, regardless of the ownership of any physical device upon which the digital item is stored.</li>
                            </ol>

                            <br></br>
                            <p class="align-center"><strong>VII. GENERAL PROVISIONS</strong></p>

                            {pets && pets.length > 0 && (
                                <>
                                    <p><strong><u>Pets</u></strong></p>
                                    <ol>
                                        {pets.map((caretaker, index) => {
                                            const guardianInfo = findPersonInfo(caretaker.guardian, relatives, Object.values(kids), spouseInfo);
                                            const backupInfo = caretaker.backup ? findPersonInfo(caretaker.backup, relatives, Object.values(kids), spouseInfo) : null;
                                            console.log(caretaker.petName)

                                            return (
                                                <React.Fragment key={index}>
                                                    <li>
                                                        Where I leave my pet {caretaker.petName} which is healthy, I appoint {capitalLetters(guardianInfo.fullName)} of {capitalLetters(guardianInfo.city)}, {capitalLetters(guardianInfo.province)}, {capitalLetters(guardianInfo.country)} to be the caretaker,
                                                        to care of it as it's own with all the rights and responsibilities of ownership.

                                                        {caretaker.backup && (
                                                            <ul>
                                                                If {capitalLetters(guardianInfo.fullName)} should refuse or be unable to act or continue to act as {caretaker.petName}'s guardian, then I
                                                                appoint {capitalLetters(backupInfo.fullName)}, of {capitalLetters(backupInfo.city)}, {capitalLetters(backupInfo.province)}, {capitalLetters(backupInfo.country)} to act as it's guardian.
                                                            </ul>
                                                        )}
                                                        {caretaker.amount > 0 && (
                                                            <ul>
                                                                I direct my Executor to provide a maximum of ${caretaker.amount} (CAD)
                                                                out of the residue of my estate to the pet caretaker as a one-time only sum to be used
                                                                for the future care, feeding and maintenance of my pet {caretaker.petName}.
                                                            </ul>
                                                        )}
                                                    </li>
                                                </React.Fragment>
                                            );
                                        })}
                                        <li>
                                            Where any appointed caretaker cannot afford or refuses to accept the responsibilities of ownership for any pet
                                            of mine then I give my Executor the fullest possible discretion in the placement of that pet in an alternate
                                            permanent, safe and loving environment as soon as possible.
                                        </li>
                                    </ol>
                                </>

                            )}


                            <p><strong><u>Family Law Act</u></strong></p>
                            <ol>
                                <li>I declare that all property acquired by a person as a result of my death together with any property into which
                                    such property can be traced, and all income from such property or any property into which such property can be
                                    traced, including income on such income, shall be excluded from such person&rsquo;s net family property for the
                                    purposes of Part I of the Family Law Act, R.S.O. 1990, c. F.3, as amended (the &ldquo;Family Law Act&rdquo;) and
                                    for the purposes of any provisions in any successor legislation or other legislation in any jurisdiction. For
                                    the purposes of this paragraph, the term &ldquo;net family property&rdquo; includes any property available for
                                    division or for satisfying any financial claim, between spouses upon separation, divorce, annulment or death of
                                    one of them and, for greater certainty, such term includes any net family property within the meaning of the
                                    Family Law Act. This declaration shall be an express statement within the meaning of paragraph 4(2)2 of the
                                    Family Law Act and shall have effect to the extent permitted by that statute, any successor legislation thereto
                                    or any legislation in any jurisdiction.</li>
                            </ol>

                            <p><strong><u>Individuals Omitted from Bequests</u></strong></p>
                            <ol>
                                <li>If I have omitted to leave property in this Will to one or more of my heirs as named above or have provided them
                                    with zero shares of a bequest, the failure to do so is intentional.</li>
                            </ol>

                            <p><strong><u>Insufficient Estate</u></strong></p>
                            <ol>
                                <li>If the value of my estate is insufficient to fulfill all of the bequests described in this Will, then I give my
                                    Executor full authority to decrease each bequest by a proportionate amount.</li>
                            </ol>

                            <p><strong><u>Additional Provisions</u></strong></p>
                            <ol>
                                {/* Renderizando deseos específicos */}
                                {additionalInfo.otherWishes && additionalInfo.otherWishes.length > 0 ? (
                                    additionalInfo.otherWishes.map((wish, index) => (
                                        <li key={index}>{wish}</li>
                                    ))
                                ) : (
                                    null
                                )}

                                {/* Renderizando checkbox de opciones */}
                                {additionalInfo.checkboxes.organdonation && (
                                    <li>I wish to donate my organs.</li>
                                )}
                                {additionalInfo.checkboxes.cremation && (
                                    <li>I wish to be cremated.</li>
                                )}
                                {additionalInfo.checkboxes.buried && (
                                    <li>I wish to be buried.</li>
                                )}

                                {/* Renderizando cláusula personalizada */}
                                {additionalInfo.customClauseText && (
                                    <li>{additionalInfo.customClauseText}</li>
                                )}
                            </ol>


                            <p><strong><u>No Contest Provision</u></strong></p>
                            <ol>
                                <li>If any beneficiary under this Will contests in any court any of the provisions of this Will, then each and all
                                    such persons shall not be entitled to any devises, legacies, bequests, or benefits under this Will or any
                                    codicil hereto, and such interest or share in my estate shall be disposed of as if that contesting beneficiary
                                    had not survived me.
                                </li>
                            </ol>

                            <p><strong><u>Severability</u></strong></p>
                            <ol>

                                <li>If any provisions of this Will are deemed unenforceable, the remaining provisions will remain in full force and
                                    effect.</li>
                            </ol>
                            <p>&nbsp;</p><p class="align-center"><em>The remainder of this page has
                                intentionally been left blank.</em></p><p><br /><br /> IN WITNESS WHEREOF, I have signed my name on this the _________ day of ______________________, 20______,
                                    at toronto, Ontario declaring and publishing this instrument as my Last Will, in the presence of the undersigned
                                    witnesses, who witnessed and subscribed this Last Will at my request, and in my presence, via video conference.
                                <br /><br /><br /> _____________________________<br /> {capitalLetters(personal.fullName)}  (Testator) Signature<br /> <br /><br /> SIGNED
                                AND DECLARED by {capitalLetters(personal.fullName)}  on this ____ day of ____________________, 20____ to be the Testator&rsquo;s Last Will
                                and Testament, in our presence, remotely, who at the Testator&rsquo;s request and in the presence of the Testator,
                                via video conference and in the physical presence of each other at Vaughan, Ontario, all being present at the same
                                time, have signed our names as witnesses in the Testator&rsquo;s presence on the above date. <br /><br /><br />
                                ________________________________________________<br /> Witness #1 (Nicole Barrett)<br /><br /> 665 Millway Ave.
                                #44<br /> Vaughan, ON<br /> L4K 3T8<br /> <br /><br /><br /> ________________________________________________<br />
                                Witness #2 (Dale Barrett)<br /><br /> 665 Millway Ave. #44<br /> Vaughan, ON<br /> L4K 3T8
                            </p><p class="align-center"><strong>LAST WILL AND TESTAMENT OF {capitalLetters(personal.fullName)}  </strong></p><p><br /><br /><br /><br /><br /> <br /><br /><br /><br /><br /><br /> Prepared by: Lawyers and Lattes Professional
                                Corporation<br /> Toronto, ON<br /> lawyersandlattes.com<br /> docs@lawyersandlattes.com<br />
                                <br /><br /><br /><br />
                            </p></div >
                    )
            }

        </div >
    );
});

export default WillContent;