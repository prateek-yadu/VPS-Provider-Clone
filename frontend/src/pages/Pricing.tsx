import { useEffect, useState } from "react";
import Navbar from "../components/custom/Navbar";
import { Cpu, Database, DatabaseBackup, MemoryStick } from "lucide-react";

interface Plan {
    id: number;
    name: string;
    description: string;
    price: number;
    vCPU: number;
    memory: number;
    storage: number;
    backups: number;
    validity_days: number;


}

export default function Pricing() {

    // stores plans
    const [plans, setPlans] = useState([]);

    const getPlans = async () => {
        // fetch available plans
        const response = await (await fetch("/api/v1/plans")).json();
        setPlans(response.data); // set plans returend by API call 
    };

    const purchasePlan = async (planId: number) => {

        // API call to purchase plan
        const response = await (await fetch(`/api/v1/plans/${planId}/purchase`, {
            method: "POST"
        })).json();

        // sends response
        alert(response.message);
    };

    useEffect(() => {
        getPlans();
    }, []);

    return (
        <>
            <Navbar />
            <main className="bg-primary-background py-16">
                <div className="container p-4 m-auto">
                    <div className="flex items-center justify-center flex-col gap-5">
                        <h3 className="text-6xl font-semibold text-accent"> Plans and Pricing </h3>
                        <p className="leading-7 w-1/3 text-center text-secondary-foreground">
                            Choose plan according to work specific requirement we provide wide range of affordable plans.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 my-14 px-24">
                        {plans?.map((plan: Plan) => (
                            <div className="border-[1px] px-4 py-4 border-accent/30 rounded bg-white" key={plan.id}>
                                <h3 className="text-3xl font-medium text-primary text-balance tracking-tighter">{plan.name}</h3>
                                <p className="text-secondary-foreground leading-7 mt-3 mb-6">{plan.description}</p>
                                <div className="text-4xl text-accent py-4">₹{plan.price} <span className="text-base">/month</span> </div>
                                <button className="w-full bg-accent hover:bg-accent/95 cursor-pointer text-white py-3 rounded font-medium" onClick={() => { purchasePlan(plan.id); }}>Choose Plan</button>
                                <div className="pt-8">
                                    <p className="leading-8 flex items-center text-secondary-foreground gap-4"><span className="text-accent size-5"><Cpu /></span>{plan.vCPU} vCPU</p>
                                    <p className="leading-8 flex items-center text-secondary-foreground gap-4"><span className="text-accent size-5"><MemoryStick /></span>{plan.memory} GiB RAM</p>
                                    <p className="leading-8 flex items-center text-secondary-foreground gap-4"><span className="text-accent size-5"><Database /></span>{plan.storage} GiB Storage</p>
                                    <p className="leading-8 flex items-center text-secondary-foreground gap-4"><span className="text-accent size-5"><DatabaseBackup /></span>{plan.backups} Snapshots</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
