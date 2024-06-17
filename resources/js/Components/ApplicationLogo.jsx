
import buriedIcon from '../../B.png'
import 'bootstrap-icons/font/bootstrap-icons.css';
import InputGroup from 'react-bootstrap/InputGroup';
import Image from 'react-bootstrap/Image';


export default function ApplicationLogo(props) {
    return (
        <Image style={{ position: "relative", left: "10%", width: "100px", height: "100px" }} src={buriedIcon} rounded />
    );
}
