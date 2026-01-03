import { AlertCircle, CheckCircle2, CopyIcon, Ellipsis, Plus } from "lucide-react";
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


interface VM {
    name: string;
    description?: string;
    status: string;
    image: string;
    ip: string;
    region_name: string;
    region_code: string;
    expires_at: string;
    plan: string;
    vCPU: number;
    memory: number;
    storage: number;
    backups: number;
}


export default function VPS() {
    // form data 
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [password, setPassword] = useState("");
    const [selectedPlan, setSelectedPlan] = useState("");

    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // stores drawer state
    const [plans, setPlans] = useState<UserPlan[]>([]); // stores user plan info

    // handles vm option (start, stop, restart, delete) collapasble logic
    const [isCollapsableOpen, setIsCollapsableOpen] = useState(false);
    const [openedState, setOpenedState] = useState(""); // tracks which card's collapsable to open

    const [vms, setVMs] = useState<VM[]>([]); // stores vms info

    const changeDrawerState = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const VPSRegion = "in-north-1 (India, Chhattisgarh)"; // VPS region location static for now
    const VPSOS = "Ubuntu 24.04 LTS"; // VPS OS static for now

    // gets user's subscribed plans 
    const getSubscribedPlans = async () => {
        const response = await (await (await fetch("/api/v1/profile/me/plans")).json()).data;
        setPlans(response); // sets user plan
        setSelectedPlan(response[0]?.id); // by default select plan at index 0
    };

    // gets user's VMs info
    const getVMs = async () => {
        const response = await (await (await fetch("/api/v1/vms")).json()).data;
        setVMs(response); // stores VMs info
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

    // update VM state (start, stop, restart)
    const updateVMState = async (name: string, state: string) => {

        const response = await (await fetch(`/api/v1/vms/${name}/${state}`, {
            method: "PUT"
        })).json();
        alert(response.message);

        setIsCollapsableOpen(!isCollapsableOpen); // closes collapsable
    };

    // deletes VM
    const deleteVM = async (name: string) => {

        const response = await (await fetch(`/api/v1/vms/${name}`, {
            method: "DELETE"
        })).json();
        alert(response.message);

        setIsCollapsableOpen(!isCollapsableOpen); // closes collapsable
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setPassword("");
        setSelectedPlan(plans[0]?.id);
    };

    // returns formated date eg. March 18, 2026
    const formatDate = (d: string) => {

        const givenDate = new Date(d);
        const date = givenDate.getDate().toString();
        const month = givenDate.toLocaleDateString('default', { month: "long" }); // gets month name eg. march
        const year = givenDate.getFullYear();
        return `${month + " " + date + ", " + year}`;
    };

    const changeCollapsableState = () => {
        setIsCollapsableOpen(!isCollapsableOpen);
    };

    useEffect(() => {
        getSubscribedPlans();
        getVMs();
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

            {/* Body */}
            <div className="w-full bg-white border-[1px] border-border-primary mt-8 rounded-xl">

                {/* table head  */}
                <div className="grid grid-cols-4 px-8">
                    <div className="flex items-center justify-start gap-2 py-4">
                        <span className="text-base font-semibold text-accent ">Server Details</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-4">
                        <span className="text-base font-semibold text-accent ">IP</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-4">
                        <span className="text-base font-semibold text-accent ">Status</span>
                    </div>
                </div>

                {/* Table body */}

                {/* VM Box */}
                {vms?.map((vm: VM) => (
                    <div className="px-8 py-6 grid grid-cols-4 border-t-[1px] border-border-primary" key={vm.name}>

                        {/* grid 1 - VM and plan Info */}
                        <div className="grid grid-cols-[32px_1fr] gap-x-4 grid-rows-2 items-center">
                            <img src="/images/os/ubuntu.png" alt="" className="size-8" />
                            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-accent">{vm.name}</h4>
                            <p className="col-end-3 text-muted flex items-center gap-3 text-sm">{vm.plan}  <span className="font-light">|</span> <span className="bg-primary-background text-primary/80 font-semibold ring-1 ring-border-primary rounded-full text-xs px-2 py-1">Expires at {formatDate(vm.expires_at)}</span></p>
                        </div>

                        {/* grid 2 - IP Address */}
                        <div className="flex items-center justify-center text-primary gap-3">
                            {vm.ip}
                            <CopyIcon className="size-4 text-accent/70 hover:text-accent cursor-pointer" onClick={() => {
                                navigator.clipboard.writeText(vm.ip);
                                alert("IP Coppied");
                            }} />
                        </div>

                        {/* grid 3 - VM Status  */}
                        <div className="flex items-center justify-center text-primary gap-2">
                            {vm.status === "Stopped" && <AlertCircle className="size-7 text-white fill-red-600" />}
                            {vm.status === "Running" && <CheckCircle2 className="size-7 fill-green-600 text-white" />}

                            {vm.status}
                        </div>

                        {/* grid 4 - vm options (firewall, backup, start, stop, restart, delete) */}
                        <div className="flex items-center justify-end gap-6 relative">
                            <button className="text-accent px-4 py-2 ring-1 rounded ring-accent text-sm font-medium hover:bg-accent hover:text-white transition-all duration-300 cursor-pointer">Manage</button>
                            <button className="text-accent/70 hover:text-accent cursor-pointer transition-all duration-300 z-40" onClick={() => {
                                changeCollapsableState();
                                setOpenedState(vm.name);
                            }}><Ellipsis /></button>

                            {/* VMs options collapsable (start, stop, restart, delete) */}
                            <div className={`${isCollapsableOpen && vm.name == openedState ? "absolute" : "hidden"} border-[1px] rounded border-border-primary bg-white -bottom-[111px] w-36 right-10 z-50`}>
                                <ul className="flex items-start flex-col w-full">
                                    <li className="w-full"><button className="px-2 py-2 hover:bg-accent/[6%] hover:text-accent text-primary cursor-pointer w-full rounded-t" onClick={() => {
                                        updateVMState(vm.name, "start");
                                    }}>Start</button></li>
                                    <li className="w-full"><button className="px-2 py-2 hover:bg-accent/[6%] hover:text-accent text-primary cursor-pointer w-full" onClick={() => {
                                        updateVMState(vm.name, "stop");
                                    }}>Stop</button></li>
                                    <li className="w-full"><button className="px-2 py-2 hover:bg-accent/[6%] hover:text-accent text-primary cursor-pointer w-full" onClick={() => {
                                        updateVMState(vm.name, "restart");
                                    }}>Restart</button></li>
                                    <li className="w-full"><button className="px-2 py-2 hover:bg-red-50 text-red-600 cursor-pointer w-full rounded-b" onClick={() => {
                                        deleteVM(vm.name);
                                    }}>Delete</button></li>
                                </ul>
                            </div>
                        </div>

                        {/* overlay screen */}
                        <div className={`${isCollapsableOpen ? "absolute" : "hidden"} top-0 left-0 right-0 bottom-0 z-40`} onClick={() => {
                            changeCollapsableState();
                        }}></div>
                    </div>
                ))}

            </div>

        </main>

    );
}
