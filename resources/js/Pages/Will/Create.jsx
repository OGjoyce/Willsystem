import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Create({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Home</h2>}
        >
            <Head title={"Welcome, "+user} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg container">


                    <div className="columns-3 ...">
                    <div className="w-full" ><p> I want to create my first will</p></div>
                    <div className="w-full"><p>Tell us about more!</p></div>
                    <div className="w-full"><p>contact an agent!</p></div>
                    </div>


                    <div className="columns-3 ...">
                    <div className="w-full" ><p>Check my will status</p></div>
                    <div className="w-full"><p>Check my wills</p></div>
                    <div className="w-full"><p>Check my POAS</p></div>
                    </div>

                    <div className="columns-3 ...">
                    <div className="w-full" ><p>Pricing</p></div>
                    <div className="w-full"><p>option</p></div>
                    <div className="w-full"><p>option</p></div>
                    </div>


                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
