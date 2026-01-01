import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface UserPlan {
    id: string;
    in_use: number;
    purchased_at: string;
    expires_at: string;
    name: string;
    vCPU: number;
    storage: number;
    backups: number;
    memory: number;
}

export default function VPS() {
    // form data 
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [password, setPassword] = useState("");
    const [selectedPlan, setSelectedPlan] = useState("");

    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // stores drawer state
    const [plans, setPlans] = useState<UserPlan[]>([]); // stores user plan info

    const changeDrawerState = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const VPSRegion = "in-north-1 (India, Chhattisgarh)"; // VPS region location static for now
    const VPSOS = "Ubuntu 24.04 LTS"; // VPS OS static for now

    // gets user's subscribed plans 
    const getSubscribedPlans = async () => {
        const response = await (await (await fetch("/api/v1/profile/me/plans")).json()).data;
        setPlans(response); // sets user plan\
        setSelectedPlan(response[0]?.id);
    };

    // create VM request
    const createVM = async () => {
        const response = await (await fetch("/api/v1/vms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ vmName: name, vmDescription: description, planId: selectedPlan })
        })).json();
        alert(response.message);
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setPassword("");
        setSelectedPlan(plans[0]?.id);
    };

    useEffect(() => {
        getSubscribedPlans();
    }, []);

    return (
        <main className="text-primary">

            {/* Drawer */}
            <div className={`${isDrawerOpen ? "absolute" : "hidden"} right-0 top-0 bottom-0 w-3xl z-50 bg-white border-l-[1px] border-border-primary`}>
                {/* header */}
                <div className="flex items-center justify-start px-4 py-3 border-b-[1px] border-border-primary">
                    <h5 className="scroll-m-20 text-lg font-medium tracking-tight">Create VPS</h5>
                </div>

                {/* body */}
                <form className="px-6 py-8 space-y-8">
                    {/* vm name */}
                    <div className="grid grid-cols-2 items-center justify-between">
                        <label htmlFor="name" className="text-secondary-foreground text-base">VM Name</label>
                        <input type="text" name="name" id="name" value={name} onChange={(e) => {
                            setName(e.target.value);
                        }} className="outline-none border-[1px] rounded border-accent/20 px-2 py-1 text-secondary-foreground bg-primary-background/50 hover:border-accent/40 focus:border-accent/40 focus:shadow" />
                    </div>

                    {/* vm description */}
                    <div className="grid grid-cols-2 items-center justify-between">
                        <label htmlFor="description" className="text-secondary-foreground text-base self-baseline">Description <span className="bg-primary-background text-primary/80 font-semibold ring-1 ring-border-primary rounded-full text-xs px-2 py-1 ml-2">optional</span></label>
                        <textarea name="description" id="description" value={description} onChange={(e) => {
                            setDescription(e.target.value);
                        }} className="outline-none border-[1px] rounded border-accent/20 px-2 py-1 text-secondary-foreground bg-primary-background/50 hover:border-accent/40 focus:border-accent/40 focus:shadow max-h-24 min-h-24" />
                    </div>

                    {/* vm root password */}
                    <div className="grid grid-cols-2 items-center justify-between">
                        <label htmlFor="password" className="text-secondary-foreground text-base">Root password</label>
                        <input type="password" name="password" id="password" value={password} onChange={(e) => {
                            setPassword(e.target.value);
                        }} className="outline-none border-[1px] rounded border-accent/20 px-2 py-1 text-secondary-foreground bg-primary-background/50 hover:border-accent/40 focus:border-accent/40 focus:shadow" />
                    </div>

                    {/* OS selection */}
                    <div className="grid grid-cols-2 items-center justify-between">
                        <label htmlFor="os" className="text-secondary-foreground text-base">Operating System</label>
                        <input type="text" name="os" id="os" className="outline-none border-[1px] rounded border-accent/20 px-2 py-1 text-primary/50 bg-primary-background/50 hover:border-accent/40 focus:border-accent/40 focus:shadow" value={VPSOS} readOnly />
                    </div>

                    {/* region selection */}
                    <div className="grid grid-cols-2 items-center justify-between">
                        <label htmlFor="region" className="text-secondary-foreground text-base">Region</label>
                        <input type="text" name="region" id="region" className="outline-none border-[1px] rounded border-accent/20 px-2 py-1 text-primary/50 bg-primary-background/50 hover:border-accent/40 focus:border-accent/40 focus:shadow" value={VPSRegion} readOnly />
                    </div>

                    {/* plan selection */}
                    <div className="grid grid-cols-2 items-center justify-between">
                        <label htmlFor="plan" className="text-secondary-foreground text-base">Plan</label>
                        <select name="plan" id="plan" className="outline-none border-[1px] rounded border-accent/20 px-2 py-1 text-secondary-foreground bg-primary-background/50 hover:border-accent/40 focus:border-accent/40 focus:shadow" onChange={(e) => {
                            setSelectedPlan(e.target.value);
                        }} value={selectedPlan}>
                            {plans?.map((plan: UserPlan) => (
                                plan.in_use != 1 &&
                                <option value={plan.id} className="bg-primary-background text-primary" key={plan.id}>{plan.name} {"(" + plan.vCPU + " vCPU, " + plan.memory + " GiB Memory, " + plan.storage + " GiB Storage)"}</option>
                            ))}
                        </select>
                    </div>
                </form>

                {/* footer */}
                <div className="absolute bottom-0 px-6 left-0 right-0">
                    <div className="flex items-center justify-end my-6 gap-4 w-full">
                        <button className=" bg-accent/5 px-2 py-1 rounded text-sm border-[1px] border-border-primary cursor-pointer hover:bg-accent/10 hover:text-accent" onClick={() => {
                            changeDrawerState();
                            resetForm();
                        }}>cancel</button>
                        <button className="bg-accent text-white px-2 py-1 rounded text-sm hover:bg-accent/90 cursor-pointer" onClick={() => { createVM(); }}>create vm</button>
                    </div>
                </div>

            </div>

            {/* Drawer background */}
            <div className={`${isDrawerOpen ? "absolute" : "hidden"} z-40 top-0 left-0 right-0 bottom-0 bg-accent/20`} onClick={() => {
                changeDrawerState();
                resetForm();
            }}></div>

            {/* Header */}
            <div className="flex items-center justify-between mt-4">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    VPS - Overview
                </h3>
                <button className="flex items-center gap-2 bg-accent py-2 text-primary-background px-4 rounded text-sm font-medium hover:bg-accent/90 cursor-pointer" onClick={() => {
                    changeDrawerState();
                }}> <Plus className="size-5" />Create VM</button>
            </div>

        </main>

    );
}
