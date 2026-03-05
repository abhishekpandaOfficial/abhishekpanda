import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { Navigation } from "@/components/layout/Navigation";
import { useTheme } from "@/components/ThemeProvider";

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const MODELS = [
  { id:"gpt4o",   name:"GPT-4o",            short:"GPT-4o",   provider:"OpenAI",    col:"#10a37f", layers:96, heads:96, dim:12288, params:"~1.8T", vocab:100256, ctx:"128k", arch:"Decoder-only Transformer",      norm:"Pre-LayerNorm", act:"GELU",  pos:"RoPE"       },
  { id:"claude",  name:"Claude 3.5 Sonnet", short:"Claude",   provider:"Anthropic", col:"#f59e0b", layers:48, heads:64, dim:8192,  params:"~200B", vocab:100352, ctx:"200k", arch:"Decoder-only Transformer",      norm:"Pre-RMSNorm",  act:"SiLU",  pos:"RoPE"       },
  { id:"gemini",  name:"Gemini 1.5 Pro",    short:"Gemini",   provider:"Google",    col:"#4285f4", layers:64, heads:80, dim:10240, params:"~540B", vocab:256000, ctx:"1M",   arch:"Mixture-of-Experts Transformer", norm:"Pre-LayerNorm",act:"GELU",  pos:"ALiBi+RoPE" },
  { id:"llama",   name:"Llama 3.1 70B",     short:"Llama",    provider:"Meta",      col:"#6366f1", layers:80, heads:64, dim:8192,  params:"70B",   vocab:128256, ctx:"128k", arch:"GQA Transformer",               norm:"Pre-RMSNorm",  act:"SiLU",  pos:"RoPE"       },
  { id:"mistral", name:"Mistral Large 2",   short:"Mistral",  provider:"Mistral",   col:"#f43f5e", layers:32, heads:32, dim:4096,  params:"123B",  vocab:32000,  ctx:"128k", arch:"Sliding-Window Attention",       norm:"Pre-RMSNorm",  act:"SiLU",  pos:"RoPE"       },
];

const STAGES = [
  { key:"tok",    label:"Tokenization",         icon:"◈", col:"#ff6b6b", lCol:"#cc2222", ms:2000,
    plain:"Your text is split into small word-pieces the model can read.",
    input:"Raw text string",  output:"Token ID array  [ t₁… tₙ ]",
    math:"text → [ t₁, t₂, …, tₙ ]",
    desc:"BPE / SentencePiece splits the raw input into sub-word token IDs mapped to the model's vocabulary.",
    zoom:{ far:"Full token sequence — each cube is one sub-word unit dropped from the vocabulary.", mid:"BPE merge pairs: common words stay whole; rare words split into sub-word ##fragments. Hue = token position.", near:"Single token cube.  Width ∝ log-frequency in the training corpus.  <s> and </s> mark sequence boundaries." }},
  { key:"emb",    label:"Token Embedding",       icon:"⬡", col:"#fbbf24", lCol:"#d97706", ms:1600,
    plain:"Each token is converted into a long list of numbers that capture its meaning.",
    input:"Token ID array",   output:"Dense vectors  ℝᵈ per token",
    math:"E(tᵢ) = Wₑ · one_hot(tᵢ)  ∈  ℝᵈ",
    desc:"Each token ID is looked up in the learned embedding matrix Wₑ producing a dense d_model-dimensional vector.",
    zoom:{ far:"Each column of cylinders = one token's full embedding vector in ℝᵈ space.", mid:"Bar height = activation magnitude per embedding dimension. More dims = larger d_model (model-specific).", near:"Individual dimension activation.  Similar tokens cluster nearby in this high-dimensional semantic space." }},
  { key:"pos",    label:"Positional Encoding",   icon:"∿", col:"#34d399", lCol:"#059669", ms:1400,
    plain:"The model is told where each word sits in the sentence — position 1, 2, 3…",
    input:"Token embeddings",  output:"Position-aware embeddings",
    math:"PE(p,2i) = sin(p / 10000^(2i/d))",
    desc:"Sinusoidal or RoPE position signals are added to every embedding, injecting sequence-order information.",
    zoom:{ far:"Multi-frequency sine waves encode position at different granularities across the sequence.", mid:"Each wave colour = one PE frequency band. Low-freq waves = coarse position; high-freq = fine-grained order.", near:"Node sphere = one token position. Its y-offset = summed PE contribution at this position." }},
  { key:"attn",   label:"Multi-Head Attention",  icon:"⊛", col:"#60a5fa", lCol:"#2563eb", ms:2400,
    plain:"Every word looks at every other word to decide which ones matter most for understanding.",
    input:"Position-aware embeddings",  output:"Context-rich hidden states",
    math:"Attn(Q,K,V) = softmax(QKᵀ / √dₖ) · V",
    desc:"Parallel attention heads each project Q, K, V then compute scaled dot-product attention simultaneously.",
    zoom:{ far:"Token ring: every node attends to every other node. Coloured rings = separate attention heads.", mid:"Line brightness = attention weight between that token pair in that head. Brighter = stronger dependency.", near:"Halo ring around each sphere = head-specific key/query scaling factor (dₖ = d_model / heads)." }},
  { key:"ffn",    label:"Feed-Forward Network",  icon:"⊞", col:"#c084fc", lCol:"#7c3aed", ms:1800,
    plain:"A mini neural network refines each word's meaning using what attention discovered.",
    input:"Attention output",  output:"Refined hidden states",
    math:"FFN(x) = GELU(xW₁ + b₁) W₂ + b₂",
    desc:"A position-wise 2-layer MLP with 4× hidden expansion is applied independently at every token position.",
    zoom:{ far:"Three rings: input layer → 4× wider hidden layer → output layer projection. Particles = activations.", mid:"Node glow intensity = GELU activation magnitude.  Hidden ring is 4× denser — the FFN bottleneck expansion.", near:"Individual neuron activation post-GELU.  Inactive nodes (near-zero) are dim; strongly activated nodes glow." }},
  { key:"norm",   label:"LayerNorm + Residual",  icon:"⊜", col:"#fb923c", lCol:"#ea580c", ms:1200,
    plain:"The numbers are re-scaled to a stable range so the model doesn't go out of control.",
    input:"Raw sublayer output  +  residual",  output:"Normalised activations",
    math:"x′ = LayerNorm(x + Sublayer(x))",
    desc:"Pre-norm residual connections wrap each sublayer; RMSNorm re-scales activations to stabilise deep training.",
    zoom:{ far:"Histogram of activation values converging from a ragged distribution to a normalised Gaussian.", mid:"Orange guide curve = target N(0,1) distribution after LayerNorm.  Bars = actual activation buckets.", near:"Each bar = one activation bucket. Pre-norm: x is normalised before entering sublayer, not after." }},
  { key:"logit",  label:"Logit Projection",      icon:"▦", col:"#22d3ee", lCol:"#0891b2", ms:1400,
    plain:"The final hidden state is scored against every word in the vocabulary to pick the best next word.",
    input:"Final hidden state  hₙ",  output:"Vocabulary scores  ℝ|V|",
    math:"L = W_vocab · h_final  ∈  ℝ^|V|",
    desc:"The final hidden state is linearly projected by the unembedding matrix onto the full vocabulary dimension.",
    zoom:{ far:`Vocab bar chart — |V| bars one per token in the vocabulary. Cyan bars = top-k candidates.`, mid:"Tall cyan bars = tokens with highest raw logit scores before softmax.  Long tail = improbable tokens.", near:"Raw logit value before temperature scaling.  Higher logit → exponentially higher probability after softmax." }},
  { key:"sample", label:"Sampling + Decode",     icon:"◎", col:"#f87171", lCol:"#dc2626", ms:1600,
    plain:"The model picks the next word by randomly sampling from the top probable candidates.",
    input:"Vocabulary scores",  output:"1 sampled token ID",
    math:"xₜ₊₁ ~ top-p( softmax(L / τ) )",
    desc:"Temperature scaling sharpens or flattens the distribution; nucleus sampling draws from the top-p mass.",
    zoom:{ far:"Orbiting candidate tokens ranked by probability.  Central red sphere = sampled / selected token.", mid:"Sphere size ∝ probability mass after top-p filtering.  Spark cloud = sampling stochasticity (τ effect).", near:"Selected token (centre). Temperature τ < 1 collapses the orbit inward; τ > 1 spreads it outward." }},
  { key:"stream", label:"Token Streaming",       icon:"▶", col:"#4ade80", lCol:"#16a34a", ms:2600,
    plain:"The model repeats the whole process, adding one new word at a time, until the answer is complete.",
    input:"Sampled token  →  appended to context",  output:"Full generated response",
    math:"x₁, x₂, … autoregressive → EOS",
    desc:"The model emits one token per forward pass, conditioning each new token on all prior context, until EOS.",
    zoom:{ far:"Full output sequence materialising left-to-right.  Blinking cursor marks the live emission point.", mid:"Each block = one generated token.  Hue shifts across the sequence as autoregressive context grows.", near:"Current token being sampled.  The KV-cache from all previous tokens is reused — O(n) not O(n²) per step." }},
];

/* ═══════════════════════════════════════════════════════════════
   THEMES
═══════════════════════════════════════════════════════════════ */
const TH = {
  dark:{
    bg:"#07080f",  panel:"#0b0e1a",   border:"#182038",
    alt:"#0d1120",  hi:"#ddeeff",     sec:"#6a90bc",
    mut:"#2e4a6a",  dim:"#141e30",    inp:"#060810",
    inpB:"#182038", log:"#050810",    badge:"#0c1226",
    clear:0x07080f, fog:0x07080f,
    g1:0x0d1930, g2:0x060c18,
    aI:0.28, dI:1.6, rI:2.2, ex:1.05,
    logStage:"#60a5fa", logSuccess:"#4ade80", logInfo:"#4a7890",
    logMath:"#a78bfa",  logDetail:"#3a6080",  logIo:"#34d399",
  },
  light:{
    bg:"#eaf1fc",  panel:"#ffffff",   border:"#c4d4eb",
    alt:"#f4f8fe",  hi:"#08152e",     sec:"#2a4a78",
    mut:"#6888aa",  dim:"#aac0d8",    inp:"#eef4fb",
    inpB:"#b8cce0", log:"#eef4fb",    badge:"#e0ecf8",
    clear:0xd8eaf8, fog:0xbcd4f0,
    g1:0x7899bb, g2:0x9ab4cc,
    aI:0.75, dI:2.4, rI:0.5, ex:1.5,
    logStage:"#1d4ed8", logSuccess:"#15803d", logInfo:"#336688",
    logMath:"#7c3aed",  logDetail:"#225577",  logIo:"#059669",
  },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function tokenize(text){
  const w=text.trim().split(/\s+/).filter(Boolean);
  const o=["<s>"];
  w.forEach(wd=>{ if(wd.length>6){const s=Math.ceil(wd.length*0.55);o.push(wd.slice(0,s));o.push("##"+wd.slice(s));}else o.push(wd); });
  o.push("</s>"); return o.slice(0,24);
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function pm(hex,o={}){
  const c=new THREE.Color(hex);
  return new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:o.ei??0.22,shininess:o.sh??90,transparent:o.t??false,opacity:o.op??1,wireframe:o.wf??false});
}
function cloud(n,r,hex,sz=0.07){
  const g=new THREE.BufferGeometry(),pos=new Float32Array(n*3),col=new Float32Array(n*3),c=new THREE.Color(hex);
  for(let i=0;i<n;i++){
    const ri=r*(0.3+Math.random()*0.9),th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);
    pos[i*3]=ri*Math.sin(ph)*Math.cos(th);pos[i*3+1]=ri*Math.sin(ph)*Math.sin(th)*0.55;pos[i*3+2]=ri*Math.cos(ph);
    const v=0.5+Math.random()*0.5;col[i*3]=Math.min(1,c.r*v);col[i*3+1]=Math.min(1,c.g*v);col[i*3+2]=Math.min(1,c.b*v);
  }
  g.setAttribute("position",new THREE.BufferAttribute(pos,3));
  g.setAttribute("color",new THREE.BufferAttribute(col,3));
  return new THREE.Points(g,new THREE.PointsMaterial({size:sz,vertexColors:true,transparent:true,opacity:0.9,sizeAttenuation:true}));
}
function dispose(g){g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){Array.isArray(o.material)?o.material.forEach(m=>m.dispose()):o.material.dispose();}});}

/* ═══════════════════════════════════════════════════════════════
   SCENE BUILDERS  — all dynamic on (model, tokens, isDark)
═══════════════════════════════════════════════════════════════ */
function sIdle(dk){
  const g=new THREE.Group();g.userData.d=true;
  const c=cloud(2800,9,dk?"#1144cc":"#3366dd",0.062);g.add(c);
  [0,1,2].forEach(ri=>{
    const m=new THREE.Mesh(new THREE.IcosahedronGeometry(2.1+ri,ri===1?2:1),pm(dk?"#0a2a88":"#3355cc",{wf:true,t:true,op:0.18-ri*0.04,ei:0.08,sh:0}));
    m.rotation.x=ri*0.55;g.add(m);
  });
  [5,7.8].forEach((r,ri)=>{
    const m=new THREE.Mesh(new THREE.TorusGeometry(r,ri?0.03:0.05,14,130),pm(dk?"#1133aa":"#4466ee",{t:true,op:0.28-ri*0.06,ei:0.3}));
    m.rotation.x=0.5+ri*0.38;g.add(m);
  });
  return{group:g,tick:t=>{
    c.rotation.y=t*0.028;c.material.opacity=0.5+0.3*Math.sin(t*0.6);
    g.children[1].rotation.y=t*0.014;g.children[1].rotation.x=t*0.009;
    g.children[2].rotation.y=-t*0.011;g.children[3].rotation.z=t*0.009;g.children[4].rotation.z=-t*0.007;
  }};
}

function sTok(tokens,model,dk){
  const g=new THREE.Group();g.userData.d=true;
  const n=tokens.length,W=Math.min(n*1.55,30),bxs=[];
  tokens.forEach((tok,i)=>{
    const x=n>1?(i/(n-1)-0.5)*W:0;
    const hue=(i/n*0.7+0.55)%1;
    const col=new THREE.Color().setHSL(hue,0.82,dk?0.52:0.44);
    const mat=pm("#"+col.getHexString(),{sh:120,ei:0.3,t:true,op:0.94});
    const bx=new THREE.Mesh(new THREE.BoxGeometry(1.12,0.7,0.55),mat);
    bx.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.12,0.7,0.55)),new THREE.LineBasicMaterial({color:dk?0xffffff:0x000000,transparent:true,opacity:dk?0.38:0.18})));
    bx.position.set(x,14,0);bx.userData={i,tok};
    g.add(bx);bxs.push(bx);
  });
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(34,5),new THREE.MeshBasicMaterial({color:new THREE.Color(model.col),transparent:true,opacity:0.08,side:THREE.DoubleSide}));
  fl.rotation.x=-Math.PI/2;fl.position.y=-1.5;g.add(fl);
  return{group:g,tick:t=>{
    bxs.forEach((b,i)=>{const p=Math.max(0,Math.min(1,t*3-i*0.11));const e=1-Math.pow(1-p,3);b.position.y=14-15.5*e;b.rotation.y=t*0.6+i*0.42;b.material.emissiveIntensity=0.15+0.35*e;});
    fl.material.opacity=0.04+0.04*Math.sin(t*1.4);g.position.y=Math.sin(t*0.4)*0.2;
  }};
}

function sEmb(tokens,model,dk){
  const g=new THREE.Group();g.userData.d=true;
  const n=tokens.length,W=Math.min(n*1.55,30);
  const DIM=Math.min(Math.max(Math.floor(model.dim/768),8),18);
  const bars=[];
  tokens.forEach((tok,i)=>{
    const tx=n>1?(i/(n-1)-0.5)*W:0;
    for(let d=0;d<DIM;d++){
      const h=0.4+Math.abs(Math.sin((i+d)*1.37+i*0.9))*3.8;
      const hue=(d/DIM+i/n*0.5)%1;
      const col=new THREE.Color().setHSL(hue,0.82,dk?0.52:0.44);
      const mat=pm("#"+col.getHexString(),{sh:110,ei:0.3,t:true,op:0.9});
      const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.048,0.048,h,8),mat);
      bar.position.set(tx+(d-DIM/2)*0.155,-3,0);bar.scale.y=0.01;
      bar.userData={h,delay:i*0.065+d*0.022};g.add(bar);bars.push(bar);
    }
  });
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-W/2-1,-3,0),new THREE.Vector3(W/2+1,-3,0)]),new THREE.LineBasicMaterial({color:dk?0x1a3055:0x6688aa,transparent:true,opacity:0.65})));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(DIM*0.155/2+0.6,0.035,8,80),pm(model.col,{t:true,op:0.38,ei:0.5}));
  ring.rotation.x=Math.PI/2;ring.position.y=-3;g.add(ring);
  return{group:g,tick:t=>{
    bars.forEach(b=>{const p=Math.max(0,Math.min(1,(t-b.userData.delay)*2.2));b.scale.y=p;b.position.y=-3+b.userData.h*p/2;b.material.emissiveIntensity=0.15+0.38*p;});
    ring.rotation.z=t*0.5;ring.material.opacity=0.2+0.32*Math.sin(t*1.2);
    g.rotation.y=Math.sin(t*0.16)*0.38;
  }};
}

function sPos(tokens,model,dk){
  const g=new THREE.Group();g.userData.d=true;
  const n=Math.max(tokens.length,3),W=Math.min(n*1.55,30);
  const sph=[];
  tokens.forEach((_,i)=>{
    const x=(i/(n-1)-0.5)*W;
    const s=new THREE.Mesh(new THREE.SphereGeometry(0.35,22,22),pm("#34d399",{sh:130,ei:0.38}));
    s.position.set(x,0,0);s.userData={i};g.add(s);sph.push(s);
  });
  const WC=Math.min(Math.max(Math.floor(model.layers/12),4),8);
  for(let wi=0;wi<WC;wi++){
    const freq=Math.pow(2,wi),amp=2.5/Math.pow(1.45,wi),z=(wi-WC/2)*0.65;
    const hue=0.36+wi*0.06;
    const col=new THREE.Color().setHSL(hue,0.88,dk?0.55:0.48);
    const pts=[];
    for(let i=0;i<=320;i++){const x=(i/320-0.5)*W*1.2;pts.push(new THREE.Vector3(x,Math.sin(i/320*Math.PI*2*freq)*amp,z));}
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.72}));
    line.userData={wi};g.add(line);
  }
  return{group:g,tick:t=>{
    sph.forEach((s,i)=>{s.position.y=Math.sin(t*1.9+i*0.42)*0.24;s.material.emissiveIntensity=0.2+0.42*Math.abs(Math.sin(t*2.1+i));});
    g.children.slice(n).forEach((l,wi)=>{l.material.opacity=0.38+0.50*Math.abs(Math.sin(t*1.5+wi*0.58));});
    g.rotation.y=Math.sin(t*0.2)*0.3;
  }};
}

function sAttn(tokens,model,dk){
  const g=new THREE.Group();g.userData.d=true;
  const n=Math.min(tokens.length,14),R=6.2;
  const NH=Math.min(Math.max(Math.floor(model.heads/16),3),6);
  const hcols=["#ff6b6b","#60a5fa","#fbbf24","#a78bfa","#34d399","#fb923c"];
  const nodes=[];
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2-Math.PI/2;
    const mat=pm(model.col,{sh:140,ei:0.35});
    const m=new THREE.Mesh(new THREE.SphereGeometry(0.44,24,24),mat);
    m.position.set(Math.cos(a)*R,0,Math.sin(a)*R);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.65,0.03,12,56),pm(model.col,{t:true,op:0.48,ei:0.45,sh:100}));
    ring.rotation.x=Math.PI/2;m.add(ring);g.add(m);nodes.push(m);
  }
  const lines=[];
  for(let h=0;h<NH;h++){
    for(let i=0;i<n;i++){for(let j=i+1;j<n;j++){
      const w=Math.random();if(w<0.3)continue;
      const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([nodes[i].position.clone(),nodes[j].position.clone()]),new THREE.LineBasicMaterial({color:new THREE.Color(hcols[h%hcols.length]),transparent:true,opacity:w*0.44}));
      ln.userData={base:w*0.44,ph:i*0.27+j*0.16+h*1.2,h};g.add(ln);lines.push(ln);
    }}
  }
  for(let h=0;h<NH;h++){
    const m=new THREE.Mesh(new THREE.TorusGeometry(R*1.38+h*0.32,0.03,12,100),pm(hcols[h%hcols.length],{t:true,op:0.28,ei:0.42,sh:80}));
    m.rotation.x=Math.PI/2;m.userData.hi=h;g.add(m);
  }
  g.add(new THREE.Mesh(new THREE.OctahedronGeometry(1.05,2),pm(dk?"#1a2a44":"#3355aa",{wf:true,t:true,op:0.55,ei:0.1,sh:0})));
  return{group:g,tick:t=>{
    g.rotation.y=t*0.19;
    lines.forEach(l=>{l.material.opacity=l.userData.base*(0.18+0.88*Math.abs(Math.sin(t*2.4+l.userData.ph)));});
    nodes.forEach((m,i)=>{const s=0.84+0.22*Math.abs(Math.sin(t*2.9+i*0.58));m.scale.setScalar(s);m.material.emissiveIntensity=0.2+0.5*Math.abs(Math.sin(t*2.4+i*0.7));});
    g.children.filter(c=>c.userData.hi!==undefined).forEach((t2,hi)=>{t2.material.opacity=0.16+0.28*Math.abs(Math.sin(t*1.8+hi*0.9));});
  }};
}

function sFFN(model,dk){
  const g=new THREE.Group();g.userData.d=true;
  const inN=Math.min(Math.max(Math.floor(model.dim/512),10),16);
  const hidN=Math.min(Math.max(Math.floor(model.dim/256)*2,20),36);
  const NODES=[inN,hidN,inN],yPos=[-5,0,5],radii=[3.8,5.5,3.8];
  const lcols=["#60a5fa","#a78bfa","#4ade80"];
  const allN=[],conns=[];
  NODES.forEach((N,li)=>{
    const layer=[];
    for(let ni=0;ni<N;ni++){
      const a=(ni/N)*Math.PI*2;
      const m=new THREE.Mesh(new THREE.SphereGeometry(0.23,14,14),pm(lcols[li],{sh:130,ei:0.32}));
      m.position.set(Math.cos(a)*radii[li],yPos[li],Math.sin(a)*radii[li]);m.userData={ph:ni*0.41+li*1.55};g.add(m);layer.push(m);
    }
    allN.push(layer);
    const disc=new THREE.Mesh(new THREE.TorusGeometry(radii[li],0.032,12,110),pm(lcols[li],{t:true,op:0.24,ei:0.38,sh:80}));
    disc.rotation.x=Math.PI/2;disc.position.y=yPos[li];g.add(disc);
  });
  for(let li=0;li<2;li++){
    for(let fi=0;fi<allN[li].length;fi++){
      const fn=allN[li][fi],tn=allN[li+1][fi%allN[li+1].length];
      const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([fn.position.clone(),tn.position.clone()]),new THREE.LineBasicMaterial({color:dk?0x1a2e55:0x9999cc,transparent:true,opacity:0.14}));
      ln.userData={ph:fi*0.2+li*2.5};g.add(ln);conns.push(ln);
    }
  }
  const sp=cloud(700,4.2,dk?"#8b5cf6":"#7c3aed",0.062);g.add(sp);
  return{group:g,tick:t=>{
    g.rotation.y=t*0.10;
    allN.forEach(l=>l.forEach(n=>{n.material.emissiveIntensity=0.16+0.58*Math.abs(Math.sin(t*3+n.userData.ph));}));
    conns.forEach(l=>{l.material.opacity=0.04+0.22*Math.abs(Math.sin(t*3.4+l.userData.ph));});
    sp.rotation.y=-t*0.24;sp.position.y=((t*2.6)%11)-5.5;sp.material.opacity=0.52+0.4*Math.sin(t*1.6);
  }};
}

function sNorm(dk){
  const g=new THREE.Group();g.userData.d=true;
  const N=62,bars=[];
  for(let i=0;i<N;i++){
    const x=(i/(N-1)-0.5)*22,tH=5.4*Math.exp(-0.5*Math.pow(x/3.9,2)),sH=0.18+Math.random()*5.2;
    const hue=0.07+0.04*(tH/5.4);
    const col=new THREE.Color().setHSL(hue,0.9,dk?0.52:0.44);
    const mat=pm("#"+col.getHexString(),{sh:110,ei:0.28,t:true,op:0.92});
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.31,1,0.24),mat);
    b.userData={sH,tH};b.scale.y=sH;b.position.set(x,sH/2-3,0);g.add(b);bars.push(b);
  }
  const pts=[];
  for(let i=0;i<=300;i++){const x=(i/300-0.5)*22;pts.push(new THREE.Vector3(x,5.4*Math.exp(-0.5*Math.pow(x/3.9,2))-3,0));}
  const guide=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:dk?0xff9f1c:0xcc5500,transparent:true,opacity:0.65,linewidth:2}));
  g.add(guide);
  return{group:g,tick:t=>{
    const p=Math.min(1,1-Math.pow(1-Math.min(1,t/1.8),3));
    bars.forEach(b=>{const h=b.userData.sH+(b.userData.tH-b.userData.sH)*p;b.scale.y=h;b.position.y=h/2-3;b.material.emissiveIntensity=0.12+0.30*p;});
    guide.material.opacity=0.18+0.52*p;g.rotation.y=Math.sin(t*0.22)*0.22;
  }};
}

function sLogit(model,dk){
  const g=new THREE.Group();g.userData.d=true;
  const N=Math.min(Math.max(Math.floor(model.vocab/1500),40),80);
  const topK=Math.min(9,Math.floor(N*0.12));
  const bars=[];
  for(let i=0;i<N;i++){
    const x=(i/(N-1)-0.5)*26,isTop=i<topK,prob=isTop?Math.exp(-i*0.5):0;
    const h=isTop?0.6+prob*5.4:0.06+Math.random()*0.44;
    const hue=isTop?0.52+i*0.022:0.62,sat=isTop?0.88:0.14,lig=dk?(isTop?0.55:0.18):(isTop?0.42:0.36);
    const col=new THREE.Color().setHSL(hue,sat,lig);
    const mat=pm("#"+col.getHexString(),{sh:isTop?140:50,ei:isTop?0.38:0.05,t:true,op:isTop?0.95:0.38});
    const b=new THREE.Mesh(new THREE.BoxGeometry(26/N*0.72,h,0.22),mat);
    b.position.set(x,h/2-3,0);b.userData={h,isTop,i};b.scale.y=0.01;g.add(b);bars.push(b);
  }
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-13.5,-3,0),new THREE.Vector3(13.5,-3,0)]),new THREE.LineBasicMaterial({color:dk?0x1e3a55:0x6688aa,transparent:true,opacity:0.65})));
  return{group:g,tick:t=>{
    bars.forEach((b,i)=>{const p=Math.max(0,Math.min(1,t*2-i*0.021));b.scale.y=p;b.position.y=b.userData.h*p/2-3;if(b.userData.isTop)b.material.emissiveIntensity=0.22+0.42*Math.sin(t*3.4+b.userData.i);});
    g.rotation.y=Math.sin(t*0.2)*0.22;
  }};
}

function sSample(dk){
  const g=new THREE.Group();g.userData.d=true;
  const topK=9,R=5.2,nodes=[];
  for(let i=0;i<topK;i++){
    const a=(i/topK)*Math.PI*2,prob=Math.exp(-i*0.5),sz=0.22+prob*0.88;
    const hue=0.54+i*0.048;const col=new THREE.Color().setHSL(hue,0.88,dk?0.55:0.44);
    const m=new THREE.Mesh(new THREE.SphereGeometry(sz,26,26),pm("#"+col.getHexString(),{sh:150,ei:0.40}));
    m.position.set(Math.cos(a)*R,0,Math.sin(a)*R);m.userData={ph:i,prob};g.add(m);nodes.push(m);
  }
  const sel=new THREE.Mesh(new THREE.SphereGeometry(1.6,40,40),pm("#f87171",{sh:180,ei:0.58}));g.add(sel);
  g.add(new THREE.Mesh(new THREE.TorusGeometry(R,0.055,16,130),pm("#f87171",{t:true,op:0.65,ei:0.52,sh:100})));
  [7.2,9.4].forEach((r2,ri)=>g.add(new THREE.Mesh(new THREE.TorusGeometry(r2,0.024,10,110),pm("#f87171",{t:true,op:0.22-ri*0.09,ei:0.32,sh:80}))));
  const sp=cloud(700,5.6,dk?"#f87171":"#dc2626",0.078);g.add(sp);
  return{group:g,tick:t=>{
    g.rotation.y=t*0.3;const s=0.85+0.19*Math.sin(t*5.5);sel.scale.setScalar(s);sel.material.emissiveIntensity=0.42+0.4*Math.sin(t*5.5);
    nodes.forEach((n,i)=>{n.material.emissiveIntensity=0.2+0.52*Math.abs(Math.sin(t*2.4+n.userData.ph));});
    sp.rotation.y=-t*0.2;sp.material.opacity=0.45+0.4*Math.sin(t*1.9);
  }};
}

function sStream(tokens,dk){
  const g=new THREE.Group();g.userData.d=true;
  const base=tokens.slice(1,-1);
  const out=base.map((t,i)=>i%4===0?t:["a","the","of","is","to","and","—"][i%7]||t);
  out.push("▪");
  const n=Math.min(out.length,16),W=Math.min(n*1.62,28),bxs=[];
  out.slice(0,n).forEach((tok,i)=>{
    const x=(i/(n-1)-0.5)*W,hue=(0.28+i*0.032)%1;
    const col=new THREE.Color().setHSL(hue,0.8,dk?0.52:0.42);
    const mat=pm("#"+col.getHexString(),{sh:120,ei:0.35,t:true,op:0});
    const b=new THREE.Mesh(new THREE.BoxGeometry(1.12,0.62,0.4),mat);
    b.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.12,0.62,0.4)),new THREE.LineBasicMaterial({color:dk?0x44ff99:0x22aa66,transparent:true,opacity:0.42})));
    b.position.set(x,0,0);b.userData={at:i*0.22};b.scale.y=0.01;g.add(b);bxs.push(b);
  });
  const cur=new THREE.Mesh(new THREE.BoxGeometry(0.07,1.3,0.07),new THREE.MeshBasicMaterial({color:0x4ade80,transparent:true,opacity:0.95}));g.add(cur);
  return{group:g,tick:t=>{
    let last=0;bxs.forEach((b,i)=>{const p=Math.max(0,Math.min(1,(t-b.userData.at)*5.5));b.material.opacity=p*0.93;b.scale.y=p;if(p>0.04)last=i;});
    if(bxs[last])cur.position.x=bxs[last].position.x+0.76;cur.material.opacity=0.5+0.5*Math.sin(t*9);
    g.rotation.y=Math.sin(t*0.12)*0.1;g.position.y=Math.sin(t*0.32)*0.2;
  }};
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function LLMVisualizer(){
  const mountRef  = useRef(null);
  const three     = useRef({});
  const sceneRef  = useRef(null);
  const camRef    = useRef({theta:0,phi:0.32,radius:25,drag:false,lx:0,ly:0,manual:false});
  const logsEnd       = useRef(null);
  const logsContainer = useRef(null);
  const themeRef      = useRef("dark");
  const pauseRef  = useRef(false);
  const abortRef  = useRef(false);

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [model,       setModel]       = useState(MODELS[1]);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [prompt,      setPrompt]      = useState("Explain quantum entanglement in simple terms");
  const [stageIdx,    setStageIdx]    = useState(-1);
  const [processing,  setProcessing]  = useState(false);
  const [paused,      setPaused]      = useState(false);
  const [tokens,      setTokens]      = useState([]);
  const [logs,        setLogs]        = useState([{msg:"System ready — select a model, enter a prompt, then click Run Inference.",type:"sys",time:""}]);
  const [zoomR,       setZoomR]       = useState(25);
  const [fps,         setFps]         = useState(60);

  const T = TH[isDark?"dark":"light"];

  /* ── Three init ─────────────────────────────────────────────── */
  useEffect(()=>{
    const mount=mountRef.current; if(!mount)return;
    const W=mount.clientWidth,H=mount.clientHeight;
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=TH.dark.ex;
    renderer.setClearColor(TH.dark.clear);
    mount.appendChild(renderer.domElement);

    const scene=new THREE.Scene();
    scene.fog=new THREE.FogExp2(new THREE.Color(TH.dark.fog),0.014);

    const ambient=new THREE.AmbientLight(0xffffff,TH.dark.aI);ambient.name="amb";scene.add(ambient);
    const sun=new THREE.DirectionalLight(0xffffff,TH.dark.dI);sun.position.set(14,22,16);sun.castShadow=true;sun.shadow.mapSize.setScalar(1024);sun.name="sun";scene.add(sun);
    scene.add(new THREE.DirectionalLight(0x8899ff,0.6)).position.set(-12,-4,-14);
    const rim=new THREE.PointLight(0x4488ff,TH.dark.rI,70);rim.position.set(0,14,0);rim.name="rim";scene.add(rim);
    const a1=new THREE.PointLight(0x10c870,2.4,45);a1.position.set(-16,0,-10);a1.name="a1";scene.add(a1);
    const a2=new THREE.PointLight(0x5566ff,2.2,45);a2.position.set(16,0,10);a2.name="a2";scene.add(a2);

    const grid=new THREE.GridHelper(80,80,TH.dark.g1,TH.dark.g2);grid.position.y=-8.5;grid.name="grid";scene.add(grid);

    const camera=new THREE.PerspectiveCamera(52,W/H,0.1,400);camera.lookAt(0,0,0);

    const clock=new THREE.Clock();
    three.current={renderer,scene,camera,clock,start:0};

    const idleSc=sIdle(true);scene.add(idleSc.group);sceneRef.current=idleSc;

    const applyCamera=()=>{
      const{theta,phi,radius}=camRef.current;
      camera.position.set(radius*Math.sin(phi)*Math.sin(theta),radius*Math.cos(phi)+1.5,radius*Math.sin(phi)*Math.cos(theta));
      camera.lookAt(0,0,0);
    };
    three.current.applyCamera=applyCamera;

    let fc=0,lt=performance.now();
    const animate=()=>{
      three.current.raf=requestAnimationFrame(animate);
      const t=clock.getElapsedTime();
      if(!camRef.current.manual){camRef.current.theta=t*0.038;camRef.current.phi=0.32+Math.sin(t*0.15)*0.04;}
      applyCamera();
      const tS=t-three.current.start;
      if(sceneRef.current?.tick)sceneRef.current.tick(tS);
      const dk=themeRef.current==="dark";
      const a1l=scene.getObjectByName("a1"),a2l=scene.getObjectByName("a2");
      if(a1l)a1l.intensity=(dk?2.4:1.1)+Math.sin(t*1.4)*0.55;
      if(a2l)a2l.intensity=(dk?2.2:1.0)+Math.sin(t*1.1+1)*0.55;
      renderer.render(scene,camera);
      fc++;const now=performance.now();if(now-lt>1000){setFps(Math.round(fc*1000/(now-lt)));fc=0;lt=now;}
    };
    animate();

    const onResize=()=>{const w2=mount.clientWidth,h2=mount.clientHeight;renderer.setSize(w2,h2);camera.aspect=w2/h2;camera.updateProjectionMatrix();};
    window.addEventListener("resize",onResize);
    return()=>{window.removeEventListener("resize",onResize);cancelAnimationFrame(three.current.raf);if(mount.contains(renderer.domElement))mount.removeChild(renderer.domElement);renderer.dispose();};
  },[]);

  /* ── Camera pointer/wheel controls ─────────────────────────── */
  useEffect(()=>{
    const el=mountRef.current;if(!el)return;
    const onWheel=e=>{
      e.preventDefault();
      camRef.current.radius=Math.max(4,Math.min(55,camRef.current.radius+e.deltaY*0.06));
      camRef.current.manual=true;setZoomR(Math.round(camRef.current.radius));
    };
    const onDown=e=>{camRef.current.drag=true;camRef.current.lx=e.clientX;camRef.current.ly=e.clientY;camRef.current.manual=true;el.setPointerCapture(e.pointerId);};
    const onMove=e=>{
      if(!camRef.current.drag)return;
      const dx=e.clientX-camRef.current.lx,dy=e.clientY-camRef.current.ly;
      camRef.current.theta-=dx*0.008;
      camRef.current.phi=Math.max(0.05,Math.min(Math.PI-0.05,camRef.current.phi+dy*0.008));
      camRef.current.lx=e.clientX;camRef.current.ly=e.clientY;
    };
    const onUp=()=>{camRef.current.drag=false;};
    el.addEventListener("wheel",onWheel,{passive:false});
    el.addEventListener("pointerdown",onDown);
    el.addEventListener("pointermove",onMove);
    el.addEventListener("pointerup",onUp);
    el.addEventListener("pointerleave",onUp);
    return()=>{el.removeEventListener("wheel",onWheel);el.removeEventListener("pointerdown",onDown);el.removeEventListener("pointermove",onMove);el.removeEventListener("pointerup",onUp);el.removeEventListener("pointerleave",onUp);};
  },[]);

  /* ── Theme sync ─────────────────────────────────────────────── */
  useEffect(()=>{
    themeRef.current=theme;
    const{renderer,scene}=three.current;if(!renderer||!scene)return;
    const th=TH[isDark?"dark":"light"];
    renderer.setClearColor(th.clear);renderer.toneMappingExposure=th.ex;
    if(scene.fog)scene.fog.color.set(th.fog);
    const a=scene.getObjectByName("amb");if(a)a.intensity=th.aI;
    const s=scene.getObjectByName("sun");if(s)s.intensity=th.dI;
    const r=scene.getObjectByName("rim");if(r)r.intensity=th.rI;
    const og=scene.getObjectByName("grid");
    if(og){scene.remove(og);og.geometry.dispose();og.material.dispose();}
    const ng=new THREE.GridHelper(80,80,th.g1,th.g2);ng.position.y=-8.5;ng.name="grid";scene.add(ng);
  },[theme,isDark]);

  const switchScene=useCallback(builder=>{
    const{scene,clock}=three.current;
    scene.children.filter(c=>c.userData.d).forEach(o=>{dispose(o);scene.remove(o);});
    three.current.start=clock.getElapsedTime();
    const r=builder();scene.add(r.group);sceneRef.current=r;
  },[]);

  const addLog=useCallback((msg,type)=>setLogs(p=>[...p.slice(-45),{msg,type,time:new Date().toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}]),[]);
  useEffect(()=>{
    if(logsContainer.current){
      logsContainer.current.scrollTop=logsContainer.current.scrollHeight;
    }
  },[logs]);

  const stageWait=useCallback(async ms=>{
    const end=Date.now()+ms;
    while(Date.now()<end){if(abortRef.current)throw new Error("abort");await sleep(40);}
    while(pauseRef.current){if(abortRef.current)throw new Error("abort");await sleep(80);}
  },[]);

  const handleSend=async()=>{
    abortRef.current=true;await sleep(120);abortRef.current=false;pauseRef.current=false;setPaused(false);
    if(!prompt.trim())return;
    const toks=tokenize(prompt);setTokens(toks);setProcessing(true);setLogs([]);
    const m=model,dk=themeRef.current==="dark";
    addLog(`◎  "${prompt.slice(0,60)}${prompt.length>60?"…":""}"`, "prompt");
    addLog(`◈  ${m.name} (${m.provider})  ·  ${m.params} params  ·  ${m.layers}L  ·  ${m.heads}H  ·  d_model=${m.dim.toLocaleString()}`, "info");
    addLog(`◈  Vocab: ${m.vocab.toLocaleString()}  ·  Context: ${m.ctx}  ·  Arch: ${m.arch}  ·  Pos: ${m.pos}  ·  Act: ${m.act}`, "info");
    addLog(`◈  ${toks.length} input tokens from ${prompt.length} characters`, "info");
    try{
      for(let i=0;i<STAGES.length;i++){
        const s=STAGES[i];setStageIdx(i);
        addLog(`${s.icon}  [${i+1}/${STAGES.length}]  ${s.label}`, "stage");
        addLog(`    💬  ${s.plain}`, "detail");
        addLog(`    IN  →  ${s.input}`, "io");
        addLog(`    OUT →  ${s.output}`, "io");
        addLog(`    ∑  ${s.math}`, "math");
        switch(s.key){
          case"tok":    switchScene(()=>sTok(toks,m,dk));     break;
          case"emb":    switchScene(()=>sEmb(toks,m,dk));     break;
          case"pos":    switchScene(()=>sPos(toks,m,dk));      break;
          case"attn":   switchScene(()=>sAttn(toks,m,dk));    break;
          case"ffn":    switchScene(()=>sFFN(m,dk));           break;
          case"norm":   switchScene(()=>sNorm(dk));            break;
          case"logit":  switchScene(()=>sLogit(m,dk));        break;
          case"sample": switchScene(()=>sSample(dk));          break;
          case"stream": switchScene(()=>sStream(toks,dk));    break;
        }
        await stageWait(s.ms);
      }
      addLog("✓  Inference complete — full response streamed to client.", "success");
    }catch(e){if(e.message!=="abort")addLog("⚠  Process interrupted.", "warn");}
    setStageIdx(-1);setProcessing(false);
    switchScene(()=>sIdle(themeRef.current==="dark"));
  };

  const togglePause=()=>{
    const next=!paused;pauseRef.current=next;setPaused(next);
    addLog(next?"⏸  PAUSED — drag to orbit, scroll to zoom in/out, examine the current stage.":"▶  Resumed — continuing pipeline.",next?"warn":"info");
  };

  const doZoom=delta=>{camRef.current.radius=Math.max(4,Math.min(55,camRef.current.radius+delta));camRef.current.manual=true;setZoomR(Math.round(camRef.current.radius));};
  const resetCam=()=>{camRef.current.theta=0;camRef.current.phi=0.32;camRef.current.radius=25;camRef.current.manual=false;setZoomR(25);};

  const stage=stageIdx>=0?STAGES[stageIdx]:null;
  const sc=stage?(isDark?stage.col:stage.lCol):model.col;
  const progress=stageIdx>=0?((stageIdx+1)/STAGES.length)*100:0;
  const zLevel=zoomR<11?"near":zoomR<19?"mid":"far";

  /* ── RENDER ─────────────────────────────────────────────────── */
  /* Nav is h-16 (4rem) mobile / h-20 (5rem) md+ — match with paddingTop */
  return(
    <>
      <Navigation />
      <div
        onClick={()=>setDropOpen(false)}
        style={{
          position:"fixed",top:0,left:0,right:0,bottom:0,
          paddingTop:"5rem",
          display:"flex",
          background:T.bg,
          fontFamily:"'JetBrains Mono','Fira Code','Courier New',monospace",
          color:T.hi,
          overflow:"hidden",
          transition:"background .3s,color .3s",
          zIndex:10,
        }}>

      {/* ═══ SIDEBAR ══════════════════════════════════════════════ */}
      <div style={{width:360,height:"100%",display:"flex",flexDirection:"column",borderRight:`1.5px solid ${T.border}`,background:T.panel,flexShrink:0,overflow:"hidden",boxShadow:isDark?"4px 0 28px #00000055":"4px 0 16px #00000011",transition:"background .3s,border .3s"}}>

        {/* Header */}
        <div style={{padding:"14px 20px 12px",borderBottom:`1px solid ${T.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:7.5,color:T.mut,letterSpacing:"0.28em",marginBottom:5,fontWeight:700}}>LLM · NEURAL ENGINE VISUALIZER</div>
            <div style={{fontSize:19,fontWeight:800,color:T.hi,letterSpacing:"0.03em",lineHeight:1}}>
              Transformer<span style={{color:model.col,textShadow:`0 0 14px ${model.col}99`}}>·</span>3D
            </div>
            <div style={{fontSize:8.5,color:T.sec,marginTop:4,letterSpacing:"0.08em"}}>Real-time pipeline inspector · 9 stages</div>
          </div>
          {/* Theme toggle — synced with site-wide theme */}
          <button onClick={e=>{e.stopPropagation();setTheme(isDark?"light":"dark");}} style={{background:T.badge,border:`1.5px solid ${T.border}`,borderRadius:8,padding:"8px 12px",cursor:"pointer",color:T.sec,fontFamily:"inherit",transition:"all .25s",display:"flex",alignItems:"center",gap:6,boxShadow:isDark?"0 0 10px #00000040":"0 0 6px #00000018"}}>
            <span style={{fontSize:15}}>{isDark?"☀":"☾"}</span>
            <span style={{fontSize:8,letterSpacing:"0.14em",fontWeight:700}}>{isDark?"LIGHT":"DARK"}</span>
          </button>
        </div>

        {/* Model dropdown */}
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <div style={{fontSize:8,color:T.mut,letterSpacing:"0.24em",marginBottom:9,fontWeight:700}}>MODEL SELECTION</div>
          <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
            {/* Trigger */}
            <button onClick={()=>setDropOpen(p=>!p)} style={{width:"100%",padding:"9px 12px",background:T.alt,border:`1.5px solid ${dropOpen?model.col+"88":T.border}`,borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all .2s",boxShadow:dropOpen?`0 0 18px ${model.col}28`:"none"}}>
              <div style={{width:11,height:11,borderRadius:"50%",background:model.col,flexShrink:0,boxShadow:`0 0 8px ${model.col}aa`}}/>
              <div style={{flex:1,textAlign:"left"}}>
                <div style={{fontSize:12,color:T.hi,fontWeight:700,letterSpacing:"0.02em"}}>{model.name}</div>
                <div style={{fontSize:8.5,color:T.sec,marginTop:2}}>{model.provider} · {model.params} · ctx {model.ctx}</div>
              </div>
              <div style={{fontSize:10,color:T.mut,transition:"transform .2s",transform:dropOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</div>
            </button>
            {/* Dropdown list */}
            {dropOpen&&(
              <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:T.panel,border:`1.5px solid ${T.border}`,borderRadius:8,zIndex:999,overflow:"hidden",boxShadow:isDark?"0 8px 40px #00000088":"0 8px 30px #00000022"}}>
                {MODELS.map(m=>{
                  const active=model.id===m.id;
                  return(
                    <div key={m.id} onClick={()=>{setModel(m);setDropOpen(false);}} style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:active?m.col+"18":T.panel,borderBottom:`1px solid ${T.border}`,transition:"background .15s"}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:m.col,flexShrink:0,boxShadow:active?`0 0 10px ${m.col}bb`:"none"}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11.5,color:active?T.hi:T.sec,fontWeight:active?700:400}}>{m.name}</div>
                        <div style={{fontSize:8,color:T.mut,marginTop:1.5}}>{m.provider} · {m.params} · {m.layers}L/{m.heads}H · d={m.dim.toLocaleString()}</div>
                      </div>
                      {active&&<div style={{fontSize:7.5,color:m.col,fontWeight:800,background:m.col+"20",padding:"2px 7px",borderRadius:3,border:`1px solid ${m.col}44`,letterSpacing:"0.1em"}}>ACTIVE</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Architecture specs */}
        <div style={{padding:"11px 18px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <div style={{fontSize:8,color:T.mut,letterSpacing:"0.24em",marginBottom:9,fontWeight:700}}>ARCHITECTURE · {model.short.toUpperCase()}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
            {[["Layers",model.layers],["Heads",model.heads],["d_model",model.dim.toLocaleString()],["Vocab",model.vocab.toLocaleString()],["Params",model.params],["Context",model.ctx]].map(([k,v])=>(
              <div key={k} style={{background:T.badge,padding:"8px 8px 7px",borderRadius:5,border:`1px solid ${T.border}`,textAlign:"center",boxShadow:isDark?"inset 0 1px 0 #ffffff06":"inset 0 1px 0 #ffffff80"}}>
                <div style={{fontSize:7.5,color:T.mut,letterSpacing:"0.12em",marginBottom:4,fontWeight:600}}>{k}</div>
                <div style={{fontSize:12,color:model.col,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:7,display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            {[["Norm",model.norm],["Act",model.act],["Pos",model.pos],["Arch",model.arch]].map(([k,v])=>(
              <div key={k} style={{background:T.badge,padding:"5px 8px",borderRadius:4,border:`1px solid ${T.border}`,display:"flex",gap:5,alignItems:"center"}}>
                <span style={{fontSize:7.5,color:T.mut,fontWeight:600,letterSpacing:"0.1em",flexShrink:0}}>{k}</span>
                <span style={{fontSize:8,color:T.sec,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <div style={{fontSize:8,color:T.mut,letterSpacing:"0.24em",marginBottom:8,fontWeight:700}}>PROMPT INPUT</div>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} disabled={processing}
            style={{width:"100%",height:70,background:T.inp,border:`1.5px solid ${T.inpB}`,color:T.hi,fontSize:10.5,padding:"8px 10px",borderRadius:5,resize:"none",outline:"none",fontFamily:"inherit",lineHeight:1.7,boxSizing:"border-box",opacity:processing?0.5:1,transition:"all .3s"}}/>
          <div style={{display:"flex",gap:7,marginTop:8}}>
            <button onClick={handleSend} disabled={processing} style={{flex:1,padding:"11px 0",background:processing?T.badge:`linear-gradient(135deg,${model.col}ee,${model.col}99)`,border:`1.5px solid ${processing?T.border:model.col+"66"}`,color:processing?T.mut:"#fff",cursor:processing?"not-allowed":"pointer",fontSize:11,letterSpacing:"0.18em",borderRadius:5,fontFamily:"inherit",fontWeight:800,transition:"all .3s",boxShadow:processing?"none":`0 4px 22px ${model.col}44`}}>
              {processing?`⟳  [${stageIdx>=0?stageIdx+1:0}/${STAGES.length}]`:"▶  RUN"}
            </button>
            {processing&&(
              <button onClick={togglePause} style={{padding:"11px 14px",background:paused?`${sc}22`:T.badge,border:`1.5px solid ${paused?sc:T.border}`,color:paused?sc:T.sec,cursor:"pointer",fontSize:12,borderRadius:5,fontFamily:"inherit",fontWeight:800,transition:"all .25s",boxShadow:paused?`0 0 14px ${sc}55`:"none"}}>
                {paused?"▶":"⏸"}
              </button>
            )}
          </div>
          {processing&&(<div style={{marginTop:7,height:3,background:T.badge,borderRadius:2}}><div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${sc}88,${sc})`,width:`${progress}%`,transition:"width .55s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 8px ${sc}`}}/></div>)}
        </div>

        {/* Log */}
        <div style={{flex:1,padding:"10px 18px 14px",overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>
          <div style={{fontSize:8,color:T.mut,letterSpacing:"0.24em",marginBottom:7,fontWeight:700,flexShrink:0}}>SYSTEM LOG</div>
          <div ref={logsContainer} style={{flex:1,overflowY:"auto",fontSize:8.5,lineHeight:1.85,background:T.log,borderRadius:5,padding:"7px 9px",border:`1px solid ${T.border}`,scrollbarWidth:"thin",scrollbarColor:`${T.border} transparent`}}>
            {logs.map((l,i)=>(
              <div key={i} style={{color:l.type==="success"?T.logSuccess:l.type==="stage"?T.logStage:l.type==="prompt"?model.col:l.type==="math"?T.logMath:l.type==="detail"?T.logDetail:l.type==="io"?T.logIo:l.type==="warn"?(isDark?"#fb923c":"#ea580c"):T.logInfo,marginBottom:1,wordBreak:"break-word"}}>
                {l.time&&<span style={{color:T.dim,marginRight:5}}>[{l.time}]</span>}
                {l.msg}
              </div>
            ))}
            <div ref={logsEnd}/>
          </div>
        </div>
      </div>

      {/* ═══ MAIN AREA: 3D canvas + right panel ═══════════════════ */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

      {/* 3D VIEWPORT */}
      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
        <div ref={mountRef} style={{width:"100%",height:"100%",cursor:processing||paused?"crosshair":"grab"}}/>

        {/* Stage HUD — top centre */}
        {stage&&(
          <div style={{position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",background:isDark?"rgba(6,8,14,0.94)":"rgba(255,255,255,0.95)",border:`2px solid ${sc}55`,backdropFilter:"blur(18px)",borderRadius:12,padding:"14px 32px",textAlign:"center",boxShadow:`0 8px 44px ${sc}2a,0 0 0 1px ${sc}18`,minWidth:420,maxWidth:640,pointerEvents:"none"}}>
            <div style={{fontSize:10.5,color:sc,letterSpacing:"0.22em",fontWeight:800,marginBottom:6}}>{stage.icon}  {stage.label.toUpperCase()}  ·  {stageIdx+1} / {STAGES.length}</div>
            <div style={{fontSize:9.5,color:T.sec,lineHeight:1.6,marginBottom:8}}>{stage.desc}</div>
            <div style={{display:"inline-block",padding:"6px 18px",background:`${sc}14`,borderRadius:6,border:`1px solid ${sc}38`}}>
              <span style={{fontSize:9.5,color:sc,fontStyle:"italic",letterSpacing:"0.06em",fontWeight:600}}>{stage.math}</span>
            </div>
            {paused&&(
              <div style={{marginTop:10,padding:"6px 14px",background:isDark?"rgba(251,146,60,0.12)":"rgba(234,88,12,0.08)",border:`1px solid ${isDark?"#fb923c55":"#ea580c55"}`,borderRadius:6}}>
                <span style={{fontSize:9,color:isDark?"#fb923c":"#ea580c",fontWeight:700,letterSpacing:"0.14em"}}>⏸  PAUSED  —  drag to orbit  ·  scroll / buttons to zoom</span>
              </div>
            )}
          </div>
        )}

        {/* Model + tokens badge — top right */}
        <div style={{position:"absolute",top:16,right:16,background:isDark?"rgba(6,8,14,0.93)":"rgba(255,255,255,0.95)",border:`1.5px solid ${T.border}`,borderRadius:10,padding:"12px 18px",textAlign:"right",pointerEvents:"none",backdropFilter:"blur(16px)",boxShadow:isDark?"0 4px 24px #00000044":"0 4px 16px #00000014",minWidth:155}}>
          <div style={{fontSize:8,color:T.mut,letterSpacing:"0.18em",marginBottom:3,fontWeight:600}}>SELECTED MODEL</div>
          <div style={{fontSize:12,color:model.col,fontWeight:800,letterSpacing:"0.04em",textShadow:isDark?`0 0 14px ${model.col}88`:"none"}}>{model.name}</div>
          <div style={{fontSize:8.5,color:T.mut,marginTop:2}}>{model.provider} · {model.params}</div>
          {tokens.length>0&&(<>
            <div style={{width:"100%",height:1,background:T.border,margin:"9px 0 7px"}}/>
            <div style={{fontSize:8,color:T.mut,letterSpacing:"0.18em",marginBottom:2}}>INPUT TOKENS</div>
            <div style={{fontSize:36,color:T.hi,fontWeight:800,lineHeight:1.05,textShadow:isDark?`0 0 20px ${model.col}55`:"none"}}>{tokens.length}</div>
            <div style={{fontSize:8.5,color:T.mut,marginTop:2}}>≈ {Math.round(tokens.length*0.75)} words</div>
          </>)}
          <div style={{marginTop:8,fontSize:8,color:T.dim,letterSpacing:"0.14em"}}>{fps} FPS · WebGL</div>
        </div>

        {/* Zoom controls removed — now in right panel */}

        {/* Zoom annotation — bottom left */}
        {stage&&(
          <div style={{position:"absolute",bottom:paused?22:16,left:16,background:isDark?"rgba(6,8,14,0.90)":"rgba(255,255,255,0.93)",border:`1.5px solid ${sc}44`,borderRadius:9,padding:"10px 14px",maxWidth:340,backdropFilter:"blur(14px)",boxShadow:`0 4px 24px ${sc}1e`,pointerEvents:"none"}}>
            <div style={{fontSize:8,color:sc,letterSpacing:"0.2em",fontWeight:800,marginBottom:5}}>
              {zLevel==="near"?"🔬 CLOSE-UP":"zLevel"==="mid"?"🔍 DETAIL":"👁 OVERVIEW"} · {zLevel.toUpperCase()} VIEW
            </div>
            <div style={{fontSize:9,color:T.sec,lineHeight:1.65}}>{stage.zoom[zLevel]}</div>
            <div style={{marginTop:7,display:"flex",gap:4}}>
              {["far","mid","near"].map(zl=>(
                <div key={zl} style={{flex:1,height:3,borderRadius:2,background:zl===zLevel?sc:T.badge,transition:"background .3s",boxShadow:zl===zLevel?`0 0 6px ${sc}`:"none"}}/>
              ))}
            </div>
            <div style={{fontSize:7.5,color:T.mut,marginTop:4,letterSpacing:"0.1em"}}>
              {zLevel==="far"?"Scroll / ⊕ to zoom in for more detail":zLevel==="mid"?"⊕ zoom in for node-level detail · ⊖ zoom out for overview":"⊖ zoom out for layer-level view · ⟲ to reset camera"}
            </div>
          </div>
        )}

        {/* Token chips */}
        {tokens.length>0&&stageIdx>=0&&(
          <div style={{position:"absolute",bottom:paused?58:20,left:0,right:0,padding:"0 22px",display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center",pointerEvents:"none"}}>
            {tokens.slice(0,20).map((tok,i)=>(
              <div key={i} style={{padding:"3px 9px",fontSize:9,borderRadius:4,letterSpacing:"0.04em",background:isDark?`${sc}1a`:`${sc}18`,border:`1.5px solid ${sc}44`,color:isDark?T.sec:T.hi,fontWeight:i===0||i===tokens.length-1?700:400,boxShadow:i===0||i===tokens.length-1?`0 0 8px ${sc}44`:"none"}}>{tok}</div>
            ))}
            {tokens.length>20&&<div style={{fontSize:9,color:T.mut,padding:"3px 5px"}}>+{tokens.length-20}</div>}
          </div>
        )}

        {/* Idle hint */}
        {stageIdx===-1&&!processing&&(
          <div style={{position:"absolute",bottom:26,left:"50%",transform:"translateX(-50%)",color:isDark?"#1a3a5a":"#9ab8cc",fontSize:9.5,letterSpacing:"0.24em",textAlign:"center",whiteSpace:"nowrap",pointerEvents:"none",fontWeight:600}}>
            NEURAL FIELD IDLE  ·  SELECT MODEL · ENTER PROMPT · RUN INFERENCE
          </div>
        )}

        {/* Drag hint — top left */}
        <div style={{position:"absolute",top:16,left:16,background:isDark?"rgba(6,8,14,0.78)":"rgba(255,255,255,0.85)",border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 11px",backdropFilter:"blur(10px)",pointerEvents:"none"}}>
          <div style={{fontSize:8,color:T.sec,letterSpacing:"0.14em",lineHeight:1.8}}>
            <div>🖱 Drag to orbit</div>
            <div>⚙ Scroll to zoom</div>
          </div>
        </div>

        {/* Bottom progress bar */}
        {processing&&(
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:T.badge}}>
            <div style={{height:"100%",background:`linear-gradient(90deg,${sc}77,${sc}dd)`,width:`${progress}%`,transition:"width .55s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 14px ${sc}cc`}}/>
          </div>
        )}

        {/* Corner tag */}
        <div style={{position:"absolute",bottom:10,right:10,fontSize:7.5,color:isDark?"#0e1e30":"#aabecf",letterSpacing:"0.14em",pointerEvents:"none"}}>
          THREE.JS r128 · MeshPhong · ACES · 9 PIPELINE STAGES
        </div>
      </div>{/* end 3D viewport */}

      {/* ═══ RIGHT PANEL ══════════════════════════════════════ */}
      <div style={{width:288,display:"flex",flexDirection:"column",borderLeft:`1.5px solid ${T.border}`,background:T.panel,flexShrink:0,overflow:"hidden",boxShadow:isDark?"-4px 0 28px #00000055":"-4px 0 16px #00000011",transition:"background .3s,border .3s"}}>

        {/* Panel header */}
        <div style={{padding:"13px 16px 11px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <div style={{fontSize:7.5,color:T.mut,letterSpacing:"0.28em",marginBottom:4,fontWeight:700}}>PIPELINE · FLOW</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:11,fontWeight:800,color:T.hi,letterSpacing:"0.04em"}}>
              {stageIdx>=0?`Step ${stageIdx+1} of ${STAGES.length}`:"9-Stage Inference Flow"}
            </div>
            {stageIdx>=0&&(
              <div style={{fontSize:9,color:sc,background:`${sc}18`,border:`1px solid ${sc}44`,borderRadius:4,padding:"2px 8px",fontWeight:700,letterSpacing:"0.1em"}}>
                {Math.round(progress)}%
              </div>
            )}
          </div>
          <div style={{marginTop:7,height:3,background:T.badge,borderRadius:2}}>
            <div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${sc}88,${sc})`,width:`${progress}%`,transition:"width .55s cubic-bezier(.4,0,.2,1)",boxShadow:progress>0?`0 0 8px ${sc}`:"none"}}/>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{flex:1,overflowY:"auto",scrollbarWidth:"thin",scrollbarColor:`${T.border} transparent`}}>

          {/* ── PIPELINE FLOW MAP ──────────────────────────── */}
          <div style={{padding:"10px 14px 4px"}}>
            <div style={{fontSize:7,color:T.mut,letterSpacing:"0.22em",marginBottom:8,fontWeight:700}}>PIPELINE STAGES</div>

            {/* Input origin */}
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 9px",borderRadius:7,background:T.badge,border:`1px solid ${T.border}`,marginBottom:2,opacity:stageIdx===-1?0.4:1}}>
              <div style={{fontSize:13,flexShrink:0}}>💬</div>
              <div>
                <div style={{fontSize:9,fontWeight:700,color:T.sec}}>Your Prompt</div>
                <div style={{fontSize:7.5,color:T.mut}}>Raw text input</div>
              </div>
            </div>

            {STAGES.map((s,i)=>{
              const active=stageIdx===i;
              const done=stageIdx>i&&stageIdx>=0;
              const upcoming=stageIdx>=0&&!active&&!done;
              const idle=stageIdx===-1;
              const sc2=isDark?s.col:s.lCol;
              const next=i<STAGES.length-1?STAGES[i+1]:null;
              return(
                <div key={s.key}>
                  {/* Arrow connector from above */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",margin:"1px 0"}}>
                    <div style={{width:2,height:5,background:done||active?sc2+"88":T.border,borderRadius:1,transition:"background .4s"}}/>
                    <div style={{display:"flex",alignItems:"center",gap:4,padding:"1px 7px",borderRadius:3,background:T.alt,border:`1px solid ${T.border}`}}>
                      <div style={{fontSize:7,color:done||active?sc2:T.mut,fontWeight:600}}>{s.input}</div>
                      <div style={{color:done||active?sc2:T.mut,fontSize:8}}>↓</div>
                    </div>
                    <div style={{width:2,height:5,background:done||active?sc2+"88":T.border,borderRadius:1,transition:"background .4s"}}/>
                  </div>

                  {/* Stage box */}
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:8,background:active?`${sc2}18`:done?(isDark?"#0d1f0f":"#edfaf1"):T.badge,border:`1.5px solid ${active?sc2:done?(isDark?"#1e4a2e":"#88ccaa"):T.border}`,boxShadow:active?`0 0 18px ${sc2}33`:"none",opacity:idle?0.4:upcoming?0.3:1,transition:"all .35s"}}>
                    <div style={{width:26,height:26,flexShrink:0,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,background:active?`${sc2}22`:done?(isDark?"#132a1c":"#d8f0e2"):T.alt,border:`1.5px solid ${active?sc2:done?(isDark?"#1e4a2e":"#88ccaa"):T.border}`,color:active?sc2:done?(isDark?"#2a7a42":"#22aa66"):T.mut,boxShadow:active?`0 0 14px ${sc2}99`:"none"}}>
                      {done&&!active?"✓":s.icon}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <div style={{fontSize:9.5,fontWeight:active?800:500,color:active?T.hi:done?(isDark?"#4ade80":"#15803d"):T.sec,lineHeight:1.2}}>{s.label}</div>
                        {active&&<div style={{fontSize:6.5,color:sc2,background:`${sc2}18`,border:`1px solid ${sc2}44`,borderRadius:3,padding:"1px 4px",fontWeight:800,letterSpacing:"0.1em",flexShrink:0}}>NOW</div>}
                      </div>
                      <div style={{fontSize:7.5,color:active?sc2:T.mut,marginTop:2,lineHeight:1.35,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s.plain}</div>
                    </div>
                    {active&&<div style={{width:6,height:6,borderRadius:"50%",background:sc2,flexShrink:0,boxShadow:`0 0 10px ${sc2}`}}/>}
                  </div>
                </div>
              );
            })}

            {/* Final output arrow + box */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",margin:"1px 0"}}>
              <div style={{width:2,height:5,background:T.border,borderRadius:1}}/>
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"1px 7px",borderRadius:3,background:T.alt,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:7,color:T.mut,fontWeight:600}}>Generated tokens</div>
                <div style={{color:T.mut,fontSize:8}}>↓</div>
              </div>
              <div style={{width:2,height:5,background:T.border,borderRadius:1}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:8,background:T.badge,border:`1px solid ${T.border}`,marginBottom:6}}>
              <div style={{fontSize:14,flexShrink:0}}>✨</div>
              <div>
                <div style={{fontSize:9,fontWeight:700,color:T.sec}}>Final Response</div>
                <div style={{fontSize:7.5,color:T.mut}}>Full generated text output</div>
              </div>
            </div>
          </div>

          {/* ── ACTIVE STAGE DETAIL ─────────────────────────── */}
          {stage&&(
            <div style={{padding:"12px 14px",borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:7,color:sc,letterSpacing:"0.22em",marginBottom:10,fontWeight:800}}>● ACTIVE · {stage.label.toUpperCase()}</div>

              {/* Plain-English callout */}
              <div style={{background:`${sc}12`,border:`2px solid ${sc}55`,borderRadius:10,padding:"10px 12px",marginBottom:9}}>
                <div style={{fontSize:7,color:sc,letterSpacing:"0.18em",fontWeight:800,marginBottom:5}}>WHAT'S HAPPENING</div>
                <div style={{fontSize:10,color:T.hi,fontWeight:600,lineHeight:1.7}}>{stage.plain}</div>
              </div>

              {/* Data flow: INPUT → STAGE → OUTPUT */}
              <div style={{marginBottom:9}}>
                <div style={{fontSize:7,color:T.mut,letterSpacing:"0.18em",fontWeight:700,marginBottom:6}}>DATA FLOW</div>
                {/* Input */}
                <div style={{background:T.badge,border:`1px solid ${T.border}`,borderRadius:6,padding:"6px 10px",marginBottom:3}}>
                  <div style={{fontSize:6.5,color:T.mut,letterSpacing:"0.14em",fontWeight:700,marginBottom:2}}>IN</div>
                  <div style={{fontSize:8.5,color:T.sec,fontWeight:600}}>{stage.input}</div>
                </div>
                {/* Arrow */}
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:5,marginBottom:3}}>
                  <div style={{flex:1,height:1.5,background:`${sc}44`,borderRadius:1}}/>
                  <div style={{fontSize:9,color:sc,fontWeight:800,background:`${sc}12`,border:`1px solid ${sc}33`,borderRadius:4,padding:"1px 7px"}}>{stage.icon} {stage.label}</div>
                  <div style={{flex:1,height:1.5,background:`${sc}44`,borderRadius:1}}/>
                </div>
                {/* Output */}
                <div style={{background:`${sc}0e`,border:`1.5px solid ${sc}44`,borderRadius:6,padding:"6px 10px"}}>
                  <div style={{fontSize:6.5,color:sc,letterSpacing:"0.14em",fontWeight:700,marginBottom:2}}>OUT</div>
                  <div style={{fontSize:8.5,color:T.hi,fontWeight:700}}>{stage.output}</div>
                </div>
              </div>

              {/* Formula */}
              <div style={{background:`${sc}0a`,border:`1px solid ${sc}33`,borderRadius:7,padding:"8px 10px",marginBottom:9}}>
                <div style={{fontSize:7,color:sc,letterSpacing:"0.18em",fontWeight:800,marginBottom:4}}>FORMULA</div>
                <div style={{fontSize:9,color:sc,fontStyle:"italic",fontWeight:600,lineHeight:1.55,wordBreak:"break-word"}}>{stage.math}</div>
              </div>

              {/* Next step teaser */}
              {stageIdx<STAGES.length-1&&(
                <div style={{background:T.badge,border:`1px dashed ${T.border}`,borderRadius:7,padding:"7px 10px"}}>
                  <div style={{fontSize:7,color:T.mut,letterSpacing:"0.18em",fontWeight:700,marginBottom:5}}>↓ NEXT STEP</div>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:22,height:22,flexShrink:0,borderRadius:5,background:T.alt,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:T.mut}}>{STAGES[stageIdx+1].icon}</div>
                    <div>
                      <div style={{fontSize:9,color:T.sec,fontWeight:700}}>{STAGES[stageIdx+1].label}</div>
                      <div style={{fontSize:7.5,color:T.mut,marginTop:1.5,lineHeight:1.4}}>{STAGES[stageIdx+1].plain}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Idle placeholder */}
          {!stage&&(
            <div style={{padding:"14px",borderTop:`1px solid ${T.border}`}}>
              <div style={{background:T.badge,border:`1px solid ${T.border}`,borderRadius:10,padding:"16px 14px",textAlign:"center"}}>
                <div style={{fontSize:22,marginBottom:7,opacity:0.35}}>▶</div>
                <div style={{fontSize:9,color:T.sec,lineHeight:1.9,fontWeight:600}}>
                  Enter a prompt and click<br/>
                  <span style={{color:isDark?"#60a5fa":"#2563eb"}}>RUN PIPELINE</span><br/>
                  to watch the full flow
                </div>
                <div style={{marginTop:8,fontSize:7.5,color:T.mut,lineHeight:1.8}}>
                  Text → Tokens → Vectors →<br/>
                  Positions → Attention → FFN →<br/>
                  Normalise → Scores → Sample → ✨
                </div>
              </div>
            </div>
          )}

          {/* Camera controls */}
          <div style={{padding:"10px 14px 14px",borderTop:`1px solid ${T.border}`}}>
            <div style={{fontSize:7,color:T.mut,letterSpacing:"0.22em",marginBottom:7,fontWeight:700}}>CAMERA</div>
            <div style={{display:"flex",gap:5,marginBottom:7}}>
              {[{lbl:"⊕",fn:()=>doZoom(-5)},{lbl:"⊖",fn:()=>doZoom(5)},{lbl:"⟲",fn:resetCam}].map(({lbl,fn})=>(
                <button key={lbl} onClick={fn} style={{flex:1,padding:"6px 0",background:T.alt,border:`1.5px solid ${T.border}`,borderRadius:6,cursor:"pointer",color:T.sec,fontFamily:"inherit",fontSize:14,fontWeight:700,transition:"all .2s"}}>{lbl}</button>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{fontSize:7,color:T.mut,letterSpacing:"0.1em",flexShrink:0}}>ZOOM</div>
              <div style={{flex:1,height:3,background:T.badge,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.round((55-zoomR+4)/55*100)}%`,background:`linear-gradient(90deg,${sc}88,${sc})`,borderRadius:2,transition:"width .25s"}}/>
              </div>
              <div style={{fontSize:8,color:T.sec,fontWeight:700,flexShrink:0,minWidth:24,textAlign:"right"}}>{Math.round(55-zoomR+4)}%</div>
            </div>
          </div>

        </div>{/* end scrollable body */}
      </div>{/* end right panel */}

      </div>{/* end main area */}
    </div>{/* end fixed shell */}
    </>
  );
}
