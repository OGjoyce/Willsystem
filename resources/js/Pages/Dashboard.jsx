import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
export default function Dashboard({ auth }) {
        let username = auth.user.name;
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{`Welcome, ${username} `}</h2>}
        >
            <Head title="Dashboard"/>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg container">


                    <div className="columns-3 ...">
                    <div className="w-full" ><Link
                                        href={route('personal')}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-black dark:hover:text-black/80 dark:focus-visible:ring-black"
                                    >
                                        I want to create a new Will
                                    </Link></div>
                    <div className="w-full"><p>Appointees</p></div>
                    <div className="w-full"><p>Asset List - Store all your assets!</p></div>
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
