export const FIELDS = [
  {key:'id', label:'Equipment ID', aliases:['equipment_id','id','asset_id','equipment','asset']},
  {key:'type', label:'Equipment type', aliases:['equipment_type','type','asset_type']},
  {key:'previous', label:'Previous reading', aliases:['previous_reading','previous','previous_meter']},
  {key:'current', label:'Current reading', aliases:['current_reading','current','reading','meter']},
  {key:'service', label:'Reading at last service', aliases:['last_service_reading','last_service','last_service_meter']},
  {key:'unit', label:'Reading unit (optional)', aliases:['unit','meter_unit','units'], optional:true}
];
const name = v=>String(v??'').trim().toLowerCase();
export function numberValue(v) {
  const s=String(v??'').trim();
  if(!/^\d+(?:\.\d{1,3})?$/.test(s)) return null;
  const [whole,fraction='']=s.split('.');
  if(BigInt(whole)>1000000000n) return null;
  return BigInt(whole)*1000n+BigInt(fraction.padEnd(3,'0'));
}
export function formatNumber(v) {
  const negative=v<0n; if(negative)v=-v;
  const fraction=String(v%1000n).padStart(3,'0').replace(/0+$/,'');
  return (negative?'-':'')+String(v/1000n)+(fraction?'.'+fraction:'');
}
export function unitValue(v) {
  const s=name(v);
  if(['hours','hour','h','hr','hrs','smr'].includes(s))return 'hours';
  if(['km','kilometres','kilometers','kilometre','kilometer','odometer'].includes(s))return 'km';
  return null;
}
export function suggestMapping(headers) {
  const out={};
  for(const f of FIELDS){const matches=headers.filter(h=>f.aliases.includes(name(h).replace(/[\s-]+/g,'_')));out[f.key]=matches.length===1?matches[0]:'';}
  return out;
}
export function validateMapping(headers,mapping) {
  const used=[];
  for(const f of FIELDS){const h=mapping[f.key];if(!h&&f.optional)continue;if(!h||!headers.includes(h))throw new Error('Choose a column for '+f.label+'.');used.push(h);}
  if(new Set(used).size!==used.length)throw new Error('Use a different source column for each field.');
}
export function prepareRules(rules) {
  if(!rules.length)throw new Error('Add at least one equipment type and its approved interval.');
  const map=new Map();
  rules.forEach((r,i)=>{
    const prefix='Type row '+(i+1)+': '; const key=name(r.type);
    if(!key||/[\t\r\n]/.test(r.type))throw new Error(prefix+'enter a type name without line breaks.');
    if(map.has(key))throw new Error(prefix+'type names must be unique (ignoring case and outer spaces).');
    const unit=unitValue(r.unit);if(!unit)throw new Error(prefix+'choose hours or km.');
    const interval=numberValue(r.interval),warning=numberValue(r.warning);
    if(interval===null||interval===0n)throw new Error(prefix+'interval must be positive, with a dot decimal and at most 3 decimal places.');
    if(warning===null||warning>interval)throw new Error(prefix+'warning distance must be between 0 and the interval.');
    map.set(key,{type:String(r.type).trim(),unit,interval,warning});
  });
  return map;
}
export function checkBatch(records,mapping,rules) {
  if(!records.length)throw new Error('Add at least one equipment row below the header.');
  if(records.length>2000)throw new Error('Check at most 2,000 equipment rows at a time.');
  const configs=prepareRules(rules), ids=new Map();
  records.forEach(r=>{const id=String(r[mapping.id]??'').trim();if(id)ids.set(id,(ids.get(id)||0)+1);});
  return records.map((r,i)=>{
    const id=String(r[mapping.id]??'').trim(),type=String(r[mapping.type]??'').trim();
    const conf=configs.get(name(type));const issues=[];
    if(!id)issues.push('Equipment ID is missing.');
    else if(/[\t\r\n]/.test(id))issues.push('Equipment ID contains a tab or line break.');
    else if(ids.get(id)>1)issues.push('Duplicate equipment ID in this batch.');
    if(!conf)issues.push(type?'No rule for equipment type “'+type+'”.':'Equipment type is missing.');
    const values={};
    for(const [key,label] of [['previous','Previous reading'],['current','Current reading'],['service','Reading at last service']]){
      values[key]=numberValue(r[mapping[key]]);
      if(values[key]===null)issues.push(label+': use a non-negative number, a dot decimal and up to 3 decimal places.');
    }
    if(mapping.unit){const unit=unitValue(r[mapping.unit]);if(!unit)issues.push('Reading unit is missing or unsupported. Use hours/SMR or km/ODOMETER.');else if(conf&&unit!==conf.unit)issues.push('Reading unit is '+unit+'; this equipment type requires '+conf.unit+'.');}
    if(values.current!==null&&values.previous!==null&&values.current<values.previous)issues.push('Reading decreased. Check the entry or investigate a meter change; no schedule was calculated.');
    if(values.current!==null&&values.service!==null&&values.service>values.current)issues.push('Last-service reading is above the current reading.');
    const base={row:i+1,id,type,reading:String(r[mapping.current]??''),unit:conf?.unit??'',status:'review',nextDue:'',remaining:'',message:issues.join(' ')};
    if(issues.length)return base;
    const due=values.service+conf.interval, remaining=due-values.current;
    const status=remaining<0n?'overdue':remaining===0n?'due':remaining<=conf.warning?'soon':'ok';
    return {...base,status,nextDue:formatNumber(due),remaining:formatNumber(remaining),message:status==='overdue'?'Past the configured due reading by '+formatNumber(-remaining)+' '+conf.unit+'.':status==='due'?'At the configured due reading.':status==='soon'?'Within your configured warning window.':'Before your configured warning window.'};
  });
}
export const STATUS_LABELS={review:'Check entry',overdue:'Overdue',due:'Due now',soon:'Due soon',ok:'Not due'};
export function resultsTsv(rows) {
  const cell=v=>{const s=String(v??'').replace(/[\t\r\n]+/g,' ');return /^[\s]*[=+@-]/.test(s)?"'"+s:s;};
  const records=[['input_row','equipment_id','equipment_type','current_reading','unit','status','next_due','remaining','notes'],...rows.map(r=>[r.row,r.id,r.type,r.reading,r.unit,STATUS_LABELS[r.status],r.nextDue,r.remaining,r.message])];
  return records.map(r=>r.map(cell).join('\t')).join('\r\n');
}
