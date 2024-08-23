import PackagesReview from "./PackagesReview";
import PackageStatus from "./PackageStatus";
import ChangeRequestForm from "./ChangeRequestForm";

export default function View() {
    return (
        <div className="w-[80%] mx-auto">
            <div className="border-t border-red-950 my-4"></div>
            <h1 className="text-4xl mb-4"> PackagesReview.jsx:</h1>
            <PackagesReview />
            <div className="border-t border-red-950 my-4"></div>
            <h1 className="text-4xl mb-4"> PackageStatus.jsx:</h1>
            <PackageStatus />
            <div className="border-t border-red-950 my-4"></div>
            <h1 className="text-4xl mb-4"> ChangeRequest.jsx:</h1>
            <ChangeRequestForm />
        </div>
    )
}