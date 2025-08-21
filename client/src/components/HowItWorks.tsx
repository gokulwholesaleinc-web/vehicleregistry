export default function HowItWorks(){
  const Step = ({n, title, body}:{n:string; title:string; body:string}) => (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <div className="text-xs font-semibold text-slate-500">STEP {n}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-slate-600 text-sm">{body}</p>
    </div>
  );
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold">How it works</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Step n="01" title="Create a VIN profile" body="Decode your VIN and set privacy (private by default)."/>
        <Step n="02" title="Log mods & maintenance" body="Attach photos and receipts. Timeline builds itself."/>
        <Step n="03" title="Transfer on sale" body="Send a secure token to the buyer; history stays with the car."/>
      </div>
    </section>
  );
}