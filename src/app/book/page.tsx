"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, LoaderCircle } from "lucide-react";

type Service = { id: string; name: string; description: string; durationMinutes: number; priceInPaise: number; category: string };
type Slot = { time: string; available: boolean };
type Staff = { id: string; name: string; workingDays: number[]; opensAt: string; closesAt: string };
function localDateString(date: Date) { const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date); const values = Object.fromEntries(parts.map(part => [part.type, part.value])); return `${values.year}-${values.month}-${values.day}`; }
function money(paise: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100); }
export default function BookingPage() {
  const [services,setServices]=useState<Service[]>([]);
  const [serviceId,setServiceId]=useState("");
  const [staffId,setStaffId]=useState("any");
  const [staff,setStaff]=useState<Staff[]>([]);
  const [date,setDate]=useState(localDateString(new Date(Date.now()+86400000)));
  const [slots,setSlots]=useState<Slot[]>([]);
  const [time,setTime]=useState("");
  const [customerName,setCustomerName]=useState("");
  const [customerPhone,setCustomerPhone]=useState("");
  const [customerEmail,setCustomerEmail]=useState("");
  const [notes,setNotes]=useState("");
  const [loadingServices,setLoadingServices]=useState(true);
  const [loadingSlots,setLoadingSlots]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  const [confirmed,setConfirmed]=useState<{id:string;serviceName:string;date:string;time:string;staffId:string;staffName?:string;status:string;priceInPaise:number}|null>(null);
  const selected=useMemo(()=>services.find(s=>s.id===serviceId),[services,serviceId]);
  useEffect(()=>{fetch("/api/services").then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);setServices(d.services);const params=new URLSearchParams(window.location.search);const requestedName=params.get("service");const requestedCategory=params.get("category");const requested=d.services.find((s:Service)=>requestedName&&s.name.toLowerCase()===requestedName.toLowerCase())??d.services.find((s:Service)=>requestedCategory&&s.category.toLowerCase()===requestedCategory.toLowerCase())??d.services[0];if(requested)setServiceId(requested.id)}).catch(e=>setError(e.message||"Could not load services.")).finally(()=>setLoadingServices(false))},[]);
  useEffect(()=>{if(!serviceId||!date)return;let alive=true;setLoadingSlots(true);setTime("");setError("");fetch("/api/availability?"+new URLSearchParams({serviceId,date,staffId})).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);if(alive){setSlots(d.slots);setStaff(d.staff??[])}}).catch(e=>{if(alive)setError(e.message||"Could not load times.")}).finally(()=>{if(alive)setLoadingSlots(false)});return()=>{alive=false}},[serviceId,date,staffId]);
  async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setError("");setSubmitting(true);try{const response=await fetch("/api/appointments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({serviceId,staffId,date,time,customerName,customerPhone,customerEmail,notes})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Booking failed.");setConfirmed(data.appointment)}catch(e){setError(e instanceof Error?e.message:"Something went wrong.");}finally{setSubmitting(false)}}
  return <main style={{minHeight:"100vh",background:"linear-gradient(135deg,rgba(248,244,238,.84),rgba(234,214,208,.62)),url(\"https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1800&q=85\") center/cover fixed",padding:"28px 20px 80px"}}>
    <div style={{maxWidth:1040,margin:"0 auto"}}>
      <Link href="/" className="wordmark" style={{display:"inline-block",color:"var(--espresso)",marginBottom:48}}>MAISON BELLE<small>BEAUTY · HAIR · SKIN</small></Link>
      {confirmed ? <section role="status" aria-live="polite" style={{maxWidth:650,margin:"30px auto",background:"var(--paper)",padding:"clamp(28px,6vw,64px)",borderRadius:4,textAlign:"center",border:"1px solid var(--line)"}}>
        <CheckCircle2 size={44} color="var(--rose-dark)" style={{margin:"0 auto 22px"}}/><p className="eyebrow section-kicker">YOUR MOMENT IS RESERVED</p><h1 className="serif" style={{fontSize:"clamp(2.5rem,6vw,4.5rem)",margin:"0 0 16px"}}>You&apos;re booked.</h1><p className="muted">Your appointment request has been saved successfully.</p>
        <div style={{textAlign:"left",background:"rgba(255,255,255,.24)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",padding:22,margin:"28px 0",lineHeight:2}}><strong>{confirmed.serviceName}</strong><br/>{confirmed.date} · {confirmed.time}<br/>Stylist: {confirmed.staffName??staff.find(person=>person.id===confirmed.staffId)?.name??"Assigned team member"}<br/>{money(confirmed.priceInPaise)} · {confirmed.status}</div>
        <p className="muted" style={{fontSize:13}}>Keep a note of your appointment details. Add customer confirmation messaging once the salon&apos;s contact and notification settings are configured.</p><Link href="/" className="pill pill-dark" style={{marginTop:18}}>Back to Maison Belle <ArrowRight size={15}/></Link>
      </section> : <><div style={{maxWidth:690,marginBottom:38}}><p className="eyebrow section-kicker">A LITTLE TIME, JUST FOR YOU</p><h1 className="serif" style={{fontSize:"clamp(3rem,7vw,6rem)",lineHeight:.98,margin:"0 0 20px"}}>Book your<br/><i>moment.</i></h1><p className="muted" style={{lineHeight:1.8,maxWidth:540}}>Choose your ritual, find a time that suits you, and leave the details to us.</p></div>
      <form onSubmit={submit} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:22,alignItems:"start"}}>
        <div style={{background:"rgba(255,255,255,.28)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:"1px solid rgba(255,255,255,.55)",padding:"clamp(20px,4vw,34px)"}}>
          <p className="eyebrow section-kicker">YOUR SERVICE</p>
          <h2 className="serif" style={{fontSize:30,margin:"0 0 12px"}}>{loadingServices?"Loading service…":selected?.name??"Choose a service"}</h2>
          <p className="muted" style={{fontSize:13,lineHeight:1.6,margin:"0 0 18px"}}>{selected?money(selected.priceInPaise)+" · "+selected.durationMinutes+" min":"Select your service from the main page first."}</p>
          <Link href="/#services" className="pill" style={{background:"rgba(255,255,255,.24)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)"}}><ArrowLeft size={14}/> Choose a different service</Link>
          <label style={{display:"block",fontSize:13,marginTop:24,marginBottom:8}}>Preferred stylist</label><select aria-label="Preferred stylist" value={staffId} onChange={e=>setStaffId(e.target.value)} style={fieldStyle}><option value="any">Any available stylist</option>{staff.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select><p className="muted" style={{fontSize:11,lineHeight:1.6,margin:"8px 0 0"}}>Choose a team member or let us find the earliest available appointment.</p>
          <p className="eyebrow section-kicker" style={{marginTop:34}}>DATE & TIME</p><label style={{display:"block",fontSize:13,marginBottom:8}}>Choose a date</label><div style={{position:"relative"}}><CalendarDays size={17} style={{position:"absolute",top:15,left:14}}/><input aria-label="Appointment date" type="date" min={localDateString(new Date())} value={date} onChange={e=>setDate(e.target.value)} required style={fieldStyle}/></div>
          <label style={{display:"block",fontSize:13,margin:"20px 0 10px"}}>Available times</label>
          {loadingSlots?<p className="muted"><LoaderCircle size={15} style={{display:"inline",verticalAlign:"middle"}}/> Checking availability…</p>:<div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>{slots.filter(s=>s.available).map(s=><button key={s.time} type="button" onClick={()=>setTime(s.time)} aria-pressed={time===s.time} className={time===s.time?"pill pill-dark":"pill"} style={{padding:"11px 4px",borderRadius:3}}><Clock3 size={13}/>{s.time}</button>)}{slots.filter(s=>s.available).length===0&&<p className="muted" style={{gridColumn:"1/-1",fontSize:13}}>No times available for this date. Please choose another day.</p>}</div>}
        </div>
        <div style={{background:"rgba(255,255,255,.28)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:"1px solid rgba(255,255,255,.55)",padding:"clamp(20px,4vw,34px)"}}>
          <p className="eyebrow section-kicker">YOUR DETAILS</p><h2 className="serif" style={{fontSize:30,margin:"0 0 22px"}}>Almost yours.</h2>
          <label style={labelStyle}>Full name<input style={fieldStyle} value={customerName} onChange={e=>setCustomerName(e.target.value)} minLength={2} maxLength={100} autoComplete="name" required/></label>
          <label style={labelStyle}>Phone number<input style={fieldStyle} type="tel" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} minLength={7} maxLength={25} autoComplete="tel" required/></label>
          <label style={labelStyle}>Email address <span className="muted">(optional)</span><input style={fieldStyle} type="email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} autoComplete="email" maxLength={254}/></label>
          <label style={labelStyle}>Anything we should know? <span className="muted">(optional)</span><textarea style={{...fieldStyle,minHeight:100,resize:"vertical"}} value={notes} onChange={e=>setNotes(e.target.value)} maxLength={1000} placeholder="Preferences, occasion, or requests"/></label>
          {error&&<p role="alert" style={{color:"#a33a32",fontSize:13,lineHeight:1.6}}>{error}</p>}
          <div style={{borderTop:"1px solid var(--line)",paddingTop:20,marginTop:10,display:"flex",justifyContent:"space-between",gap:12}}><span className="muted">Estimated total</span><strong>{selected?money(selected.priceInPaise):"—"}</strong></div>
          <button type="submit" disabled={!selected||!time||submitting||loadingServices} className="pill pill-dark" style={{width:"100%",marginTop:20,borderRadius:3,opacity:(!selected||!time||submitting)?0.6:1}}>{submitting?"Saving appointment…":"Confirm appointment"} {submitting?<LoaderCircle size={16}/>:<ArrowRight size={16}/>}</button>
          <p className="muted" style={{fontSize:11,lineHeight:1.7,marginTop:16}}>Appointment confirmation depends on successful server-side booking. Your details are used to manage this appointment.</p>
        </div>
      </form>
      <div style={{marginTop:36,fontSize:12}}><Link href="/" className="muted"><ArrowLeft size={13} style={{display:"inline",verticalAlign:"middle"}}/> Back to the salon</Link></div>
      </>}
    </div>
  </main>
}
const fieldStyle:React.CSSProperties={display:"block",width:"100%",marginTop:8,background:"rgba(255,255,255,.24)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",border:"1px solid rgba(48,35,31,.16)",borderRadius:2,padding:"13px 14px",color:"var(--espresso)",font:"inherit",fontSize:14};
const labelStyle:React.CSSProperties={display:"block",fontSize:13,marginBottom:18};
