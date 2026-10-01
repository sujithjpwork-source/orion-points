'use strict';

/* Exploration is local to this preview. The supplied Points ledger is immutable. */
(() => {
  const originalOverview = overview;
  const originalStore = storeView;
  const originalRender = render;
  const originalClose = closeModal;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const experience = {
    source: 'Purchases', milestone: 2, replaying: false, replayTimer: null,
    discoveries: new Set(), sound: false, reduced: motionPreference.matches,
    holding: false, charge: 0, frame: null, vaultEpoch: 0, phase: 'idle', reward: null
  };
  let audioContext;
  const sources = [
    { name: 'Purchases', value: 2829, icon: 'cart', color: '#93abff' },
    { name: 'Evaluations', value: 1886, icon: 'award', color: '#c99cff' },
    { name: 'Promotions', value: 5000, icon: 'gift', color: '#83eee0' }
  ];
  const discovered = id => experience.discoveries.has(id);
  const particles = (n = 28) => `<div class="star-field" aria-hidden="true">${Array.from({length:n},(_,i)=>`<span style="--x:${(i*37+11)%100}%;--y:${(i*59+7)%100}%;--delay:${-(i%9)}s;--size:${i%4===0?3:1}px"></span>`).join('')}</div>`;
  const soundIcon = () => experience.sound ? 'Sound on' : 'Sound off';

  function tone(kind) {
    if (!experience.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume();
      const now=audioContext.currentTime;
      const notes = kind==='reveal' ? [440,554.37,659.25,880] : kind==='open' ? [164.81,329.63,659.25] : [kind==='step'?523.25:392];
      notes.forEach((f,i)=>{
        const oscillator=audioContext.createOscillator(), gain=audioContext.createGain();
        oscillator.type='sine'; oscillator.frequency.value=f;
        gain.gain.setValueAtTime(0,now+i*.055);
        gain.gain.linearRampToValueAtTime(.025,now+i*.055+.02);
        gain.gain.exponentialRampToValueAtTime(.001,now+i*.055+.3);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(now+i*.055); oscillator.stop(now+i*.055+.33);
      });
    } catch (_) { /* Sound is optional. */ }
  }

  function discoveryView() {
    const steps=[['source','Trace your Points','Explore an earning source'],['journey','Replay a milestone','Follow your account journey'],['reward','Open the vault','Reveal a reward preview']];
    const count=experience.discoveries.size;
    return `<section class="discovery-bar" aria-label="Discovery route"><div class="discovery-intro"><span class="discovery-ring" style="--discovery:${count/3*100}%">${count}<small>/3</small></span><div><span class="mini-overline">DISCOVERY ROUTE</span><h2>${count===3?'Exploration complete':'Make your next move'}</h2></div></div><div class="discovery-steps">${steps.map(([id,title,desc],i)=>`<button class="discovery-step ${discovered(id)?'is-done':''}" data-discover="${id}" aria-label="${title}${discovered(id)?', explored':''}"><span>${discovered(id)?icon('check'):'0'+(i+1)}</span><div><strong>${title}</strong><small>${discovered(id)?'Explored':desc}</small></div></button>`).join('')}</div></section>`;
  }

  function recordDiscovery(id) {
    if (discovered(id)) return;
    experience.discoveries.add(id);
    const bar=document.querySelector('.discovery-bar');
    if(bar) bar.outerHTML=discoveryView();
    if(experience.discoveries.size===3){tone('reveal');toast('Discovery route complete. Your Points balance is unchanged.');}
  }

  function cockpit() {
    const current=sources.find(s=>s.name===experience.source);
    return `<section class="points-cockpit" aria-label="Your Orion Points">${particles()}<div class="cockpit-corners" aria-hidden="true"></div><div class="cockpit-copy"><div class="scene-label"><span></span>ORION POINTS</div><p class="cockpit-overline">AVAILABLE ORION POINTS</p><div class="cockpit-balance">8,772<span>PTS</span></div><p class="cockpit-credit">≈ $87.72 <span>Orion Credit</span></p><p class="cockpit-pending">${icon('clock')}943 Points pending · available Sep 30, 2026</p><div class="cockpit-actions"><a href="#store" class="btn primary">Enter reward vault${icon('gift')}</a><button class="btn secondary" data-action="checkout">Use at checkout</button></div></div><div class="crystal-console" data-parallax style="--source-color:${current.color}"><div class="crystal-orbit orbit-a"></div><div class="crystal-orbit orbit-b"></div><div class="crystal-orbit orbit-c"></div><div class="console-crosshair"></div><div class="crystal-parallax"><img src="assets/crystal.png" alt="Orion crystal" width="1254" height="1254"></div><div class="crystal-source"><span data-source-name>${current.name}</span><strong data-source-value>${fmt(current.value)}</strong><small>Points earned</small></div><span class="console-coordinate">EARNED BY SOURCE</span></div><div class="cockpit-next"><div class="next-label">NEXT REWARD <span>First payout: +1,000</span></div><button class="next-reward-art" data-reward="100" aria-label="View $100 Discount"><div class="target-ring" style="--target:87.72%"><img src="assets/chest.png" alt="" width="1254" height="1254"></div><strong>$100<span>Discount</span></strong></button><div class="next-progress"><span>8,772 / 10,000</span><strong>87.72%</strong></div><div class="progress-track"><div class="progress-fill" style="width:87.72%"></div></div><p><strong>1,228 more Points.</strong> Converting part of your $4,200.00 payout would get you there.</p><button class="text-button" data-reward="100">View reward</button></div><div class="source-dock"><span>EXPLORE YOUR POINTS</span>${sources.map(s=>`<button data-source="${s.name}" class="source-node ${experience.source===s.name?'active':''}" aria-pressed="${experience.source===s.name}" style="--source-color:${s.color}"><i>${icon(s.icon)}</i><span>${s.name}<strong>${fmt(s.value)}</strong></span><span class="source-node-scan"></span></button>`).join('')}<div class="source-total"><strong>9,715</strong><span>Total earned</span></div></div></section>`;
  }

  overview = function() {
    const original=originalOverview();
    const existing=original.slice(original.indexOf('<div class="expiry-strip">'));
    return cockpit()+discoveryView()+existing;
  };

  function accountRows() {return activities.filter(a=>a.ref==='Account #'+state.account).slice().reverse();}
  function journeyDetails() {
    const rows=accountRows(); const index=Math.min(experience.milestone,rows.length-1); const a=rows[index];
    return `<div class="journey-detail-icon">${icon(a.icon)}</div><div class="journey-event"><span class="mini-overline">${a.date} · ${a.ref}</span><h3>${a.name}</h3><p>${badge(a.status)}<span>Expires ${a.expires}</span></p></div><div class="journey-earned"><strong>+${fmt(a.points)}</strong><span>Points</span></div>`;
  }
  journeyView = function() {
    const rows=accountRows();experience.milestone=Math.min(experience.milestone,rows.length-1);
    return `<section class="journey-world panel" aria-label="Account milestone journey"><div class="journey-world-header"><div><span class="mini-overline">YOUR MILESTONES</span><h2>Every step has a story.</h2></div><div class="account-switch" aria-label="View account milestones">${['220687','158984','241120'].map(id=>`<button data-account="${id}" class="${state.account===id?'active':''}" aria-pressed="${state.account===id}">#${id}</button>`).join('')}</div></div><div class="journey-route" style="--journey-progress:${rows.length>1?experience.milestone/(rows.length-1)*100:0}%"><div class="journey-route-line"></div>${rows.map((a,i)=>`<button class="journey-stop ${i<=experience.milestone?'passed':''} ${i===experience.milestone?'selected':''}" data-journey-step="${i}" aria-pressed="${i===experience.milestone}"><span class="stop-number">0${i+1}</span><span class="stop-orbit">${icon(a.icon)}<i>${a.status==='Pending'?icon('clock'):icon('check')}</i></span><strong>${a.name.split(' — ')[0]}</strong><small>${a.date}</small><span class="stop-points">+${fmt(a.points)} Points</span></button>`).join('')}</div><div class="journey-detail" aria-live="polite">${journeyDetails()}</div><div class="journey-controls"><button class="btn secondary" data-replay>${experience.replaying?'Pause replay':'Replay your journey'}${icon('history')}</button><label class="journey-scrub-label">Timeline<input type="range" aria-label="Milestone in account journey" min="0" max="${rows.length-1}" value="${experience.milestone}" step="1" ${rows.length===1?'disabled':''} data-journey-range></label><span>Recorded milestones · No new Points earned</span></div></section>`;
  };

  function stopReplay() { clearInterval(experience.replayTimer);experience.replaying=false; }
  function selectMilestone(index,fromReplay=false) {
    if(!fromReplay)stopReplay();
    experience.milestone=Math.max(0,Math.min(Number(index),accountRows().length-1));
    const section=document.querySelector('.journey-world'); if(!section)return;
    section.querySelectorAll('[data-journey-step]').forEach((el,i)=>{el.classList.toggle('passed',i<=experience.milestone);el.classList.toggle('selected',i===experience.milestone);el.setAttribute('aria-pressed',String(i===experience.milestone));});
    section.querySelector('.journey-route').style.setProperty('--journey-progress',accountRows().length>1?experience.milestone/(accountRows().length-1)*100+'%':'0%');
    const detail=section.querySelector('.journey-detail');detail.innerHTML=journeyDetails();
    detail.classList.remove('event-arrive');void detail.offsetWidth;detail.classList.add('event-arrive');
    section.querySelector('[data-journey-range]').value=experience.milestone;
    section.querySelector('[data-replay]').innerHTML=(experience.replaying?'Pause replay':'Replay your journey')+icon('history');
    recordDiscovery('journey');tone('step');
  }

  function orbitNodeStyle(i) {
    const angle=(i/rewards.length)*Math.PI*2-Math.PI/2;
    return `--nx:${50+Math.cos(angle)*40}%;--ny:${50+Math.sin(angle)*39}%;--node-order:${i}`;
  }
  function vaultSelection() {
    const r=rewards[state.selectedReward], locked=r.cost>state.balance;
    return `<span class="vault-reward-index">REWARD ${String(state.selectedReward+1).padStart(2,'0')} / 07</span>${badge(locked?'Insufficient Points':'Available')}<div class="vault-selected-card" data-selected-card>${rewardArt(r,true)}</div><h2>${r.name}</h2><p>${r.description}</p><div class="vault-cost">${icon('spark')}<strong>${r.variable?'From ':''}${fmt(r.cost)}</strong><span>Points</span></div><div class="vault-fineprint">${r.detail}</div><button class="btn primary vault-open-button" data-reward="${r.id}">${locked?'1,228 more needed':'Open reward preview'}${icon(locked?'clock':'gift')}</button>`;
  }
  function vaultView() {
    return `<section class="reward-universe" aria-label="Interactive reward vault">${particles(36)}<header class="universe-header"><div><span class="scene-label"><span></span>THE ORION VAULT</span><h2>Choose your next reward.</h2></div><span class="universe-count">7 REWARDS<span>One collection.</span></span></header><div class="universe-body"><div class="reward-orbit" role="group" aria-label="Select one of seven rewards"><div class="orbital-rail outer"></div><div class="orbital-rail inner"></div><div class="vault-floor"></div><button class="central-vault" data-open-selected aria-label="Open selected reward preview"><div class="vault-central-halo"></div><img src="assets/chest.png" alt="Orion reward vault" width="1254" height="1254"><span>ENTER THE VAULT</span></button>${rewards.map((r,i)=>`<button class="reward-satellite ${i===state.selectedReward?'selected':''} ${r.cost>state.balance?'is-locked':''}" data-orbit-reward="${i}" style="${orbitNodeStyle(i)}" aria-pressed="${i===state.selectedReward}" aria-label="Select ${r.name}, ${r.variable?'from ':''}${fmt(r.cost)} Points"><span class="satellite-icon">${icon(r.cost>state.balance?'clock':r.icon)}</span><strong>${r.value}</strong><small>${r.variable?'From ':''}${fmt(r.cost)} PTS</small></button>`).join('')}<div class="orbit-caption">SELECT A REWARD TO DOCK</div></div><div class="vault-selection" aria-live="polite">${vaultSelection()}</div></div><div class="vault-bottom-strip"><span>${icon('spark')}8,772 Points available</span><span>${icon('gift')}90-day vouchers</span><span>${icon('check')}Selected reward · Preview only</span></div></section>`;
  }
  storeView = function() {
    const existing=originalStore();
    const catalogue=existing.slice(existing.indexOf('<details class="catalog-toggle">'));
    return vaultView()+`<div class="vault-rules">${icon('help')}<p>${storeRules}</p></div>`+discoveryView()+`<details class="card-lounge"><summary>Browse the card collection<span>Drag, turn and explore all 7 rewards</span>${icon('grid')}</summary>${galleryView()}</details>`+catalogue;
  };

  function selectOrbit(index) {
    state.selectedReward=Number(index);state.flipped=false;
    document.querySelectorAll('[data-orbit-reward]').forEach(el=>{const selected=Number(el.dataset.orbitReward)===state.selectedReward;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});
    const detail=document.querySelector('.vault-selection');if(detail){detail.innerHTML=vaultSelection();detail.classList.remove('dock-arrive');void detail.offsetWidth;detail.classList.add('dock-arrive');}
    const vault=document.querySelector('.central-vault');if(vault){vault.classList.remove('vault-dock');void vault.offsetWidth;vault.classList.add('vault-dock');}
    selectReward(state.selectedReward);tone('select');
  }

  function cancelVault() {experience.vaultEpoch++;experience.holding=false;cancelAnimationFrame(experience.frame);experience.phase='idle';modal.classList.remove('vault-dialog');}
  closeModal = function() {cancelVault();originalClose();};
  modal.addEventListener('close',cancelVault);
  function vaultFrame(r,content,step) {
    return `<div class="vault-experience">${particles(25)}<header class="vault-modal-header"><span class="scene-label">ORION VAULT</span><span>${icon('spark')}8,772 Points</span></header><div class="vault-flow">${['SELECT','UNLOCK','REVEAL'].map((x,i)=>`<span class="${i<=step?'current':''}"><b>${i<step?'✓':'0'+(i+1)}</b>${x}</span>`).join('')}</div>${content}<div class="vault-modal-footer"><span>${r.variable?'From ':''}${fmt(r.cost)} Points · 90-day voucher</span><span>Preview only · Balance unchanged</span></div></div>`;
  }
  function prepareVault(r) {
    experience.reward=r;experience.charge=0;experience.holding=false;experience.phase='charge';
    const content=`<div class="unlock-headline"><span class="mini-overline">YOUR SELECTED REWARD</span><h2 id="modal-title">${r.name}</h2><p>${r.variable?'Priced by account size. Final cost is not specified in this sample.':'Your next reward is behind these locks.'}</p></div><div class="unlock-stage" style="--charge:0" data-unlock-stage><div class="unlock-ring ring-one"></div><div class="unlock-ring ring-two"></div><div class="unlock-ring ring-three"></div><div class="unlock-flare"></div><div class="unlock-art"><img class="vault-closed-image" src="assets/chest.png" alt="Closed Orion reward vault" width="1254" height="1254"><img class="vault-open-image" src="assets/chest-open.png" alt="Open Orion reward vault" width="1254" height="1254"></div><div class="lock-status"><span>01</span><span>02</span><span>03</span></div></div><div class="charge-controls"><button class="hold-to-open" data-hold-vault aria-label="Hold to unlock reward preview"><span class="hold-fill"></span>${icon('spark')}<span data-hold-label>Hold to unlock</span><strong data-charge-number>0%</strong></button><button class="instant-open" data-instant-open>Open instantly</button><p>Hold the button or Space · Release to pause</p></div>`;
    showModal(vaultFrame(r,content,1));modal.classList.add('vault-dialog');
    setupCharge();
  }
  showReward = function(id) {
    stopReplay();const r=rewards.find(item=>item.id===id);if(!r)return;
    cancelVault();
    if(r.cost>state.balance) {
      showModal(`<div class="locked-reward"><span class="mini-overline">YOUR NEXT REWARD</span><h2 id="modal-title">$100 Discount</h2><div class="locked-card">${rewardArt(r,true)}</div><div class="locked-target"><strong>8,772</strong><span>/ 10,000 Points</span></div><div class="progress-track"><div class="progress-fill" style="width:87.72%"></div></div><p><strong>1,228 more needed</strong></p><p>Converting part of your $4,200.00 payout would get you there.</p><p class="modal-rule">First payout: +1,000 · $100 off · 90-day voucher</p><a class="btn primary modal-cta" href="#activity" data-action="close">View activity</a></div>`);
      return;
    }
    prepareVault(r);
  };

  function paintCharge() {
    const stage=document.querySelector('[data-unlock-stage]');if(!stage)return;
    const value=Math.round(experience.charge*100);
    stage.style.setProperty('--charge',experience.charge);
    document.querySelector('.hold-to-open')?.style.setProperty('--charge',experience.charge);
    const label=document.querySelector('[data-hold-label]');if(label)label.textContent=experience.holding?'Charging the locks…':value>0?'Hold to continue':'Hold to unlock';
    const number=document.querySelector('[data-charge-number]');if(number)number.textContent=value+'%';
    stage.querySelectorAll('.lock-status span').forEach((el,i)=>el.classList.toggle('unlocked',experience.charge>=(i+1)/3));
  }
  function setupCharge() {
    const button=document.querySelector('[data-hold-vault]');if(!button)return;
    let last;
    const step=time=>{
      if(experience.phase!=='charge'||!modal.open)return;
      const delta=Math.min(50,time-(last||time));last=time;
      experience.charge=Math.max(0,Math.min(1,experience.charge+(experience.holding?delta/1500:-delta/2800)));
      paintCharge();
      if(experience.charge>=1){openVault();return;}
      experience.frame=requestAnimationFrame(step);
    };
    const down=()=>{if(experience.phase!=='charge')return;experience.holding=true;tone('select');};
    const up=()=>{experience.holding=false;};
    button.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();button.focus();button.setPointerCapture(e.pointerId);down();});
    button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('lostpointercapture',up);
    button.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();down();}});
    button.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();up();}});
    button.addEventListener('blur',up);
    experience.frame=requestAnimationFrame(step);
  }
  function openVault(instant=false) {
    if(experience.phase!=='charge')return;
    experience.phase='opening';experience.holding=false;cancelAnimationFrame(experience.frame);experience.charge=1;paintCharge();
    const epoch=++experience.vaultEpoch;
    document.querySelector('[data-unlock-stage]')?.classList.add('vault-is-opening');
    document.querySelector('.charge-controls')?.classList.add('is-opening');
    tone('open');
    setTimeout(()=>{if(epoch!==experience.vaultEpoch||!modal.open)return;showSealedCard();},instant||experience.reduced?50:1200);
  }
  function showSealedCard() {
    const r=experience.reward;experience.phase='sealed';
    showModal(vaultFrame(r,`<div class="sealed-reveal"><span class="mini-overline">VAULT OPENED</span><h2 id="modal-title">One final turn.</h2><p>Turn your card to reveal ${r.name}.</p><button class="sealed-card" data-turn-final aria-label="Turn card to reveal ${r.name}"><span class="sealed-card-back"><span class="card-back-brand">ORION</span><span class="card-back-gem"><img src="assets/crystal.png" alt="" width="1254" height="1254"></span><span class="card-back-caption">POINTS COLLECTION<span>TURN TO REVEAL</span></span></span></button><button class="btn primary reveal-final-button" data-turn-final>Turn your card${icon('history')}</button></div>`,2));
    modal.classList.add('vault-dialog');
  }
  function revealFinal() {
    if(experience.phase!=='sealed')return;
    experience.phase='revealed';const r=experience.reward;tone('reveal');recordDiscovery('reward');
    showModal(vaultFrame(r,`<div class="final-reward">${confetti()}<span class="mini-overline">REWARD PREVIEW</span><h2 id="modal-title">${r.name}</h2><div class="final-reward-card">${rewardArt(r,true)}</div><p>${r.description}</p><div class="final-reward-price">${icon('spark')}<strong>${r.variable?'From ':''}${fmt(r.cost)}</strong> Points</div><p class="final-reward-rule">${r.detail}</p><div class="final-actions"><button class="btn primary" data-action="close">Back to vault</button><button class="btn secondary" data-replay-vault>Open again${icon('history')}</button></div><small>No voucher issued. Your Points balance remains 8,772.</small></div>`,2));
    modal.classList.add('vault-dialog');
  }

  function setSource(name) {
    const source=sources.find(s=>s.name===name);if(!source)return;experience.source=name;
    const console=document.querySelector('.crystal-console');console?.style.setProperty('--source-color',source.color);
    if(console){console.querySelector('[data-source-name]').textContent=name;console.querySelector('[data-source-value]').textContent=fmt(source.value);console.classList.remove('source-pulse');void console.offsetWidth;console.classList.add('source-pulse');}
    document.querySelectorAll('[data-source]').forEach(el=>{el.classList.toggle('active',el.dataset.source===name);el.setAttribute('aria-pressed',String(el.dataset.source===name));});
    recordDiscovery('source');tone('select');
  }

  function setupParallax() {
    document.querySelectorAll('[data-parallax],.reward-universe').forEach(el=>{
      el.addEventListener('pointermove',e=>{if(experience.reduced||e.pointerType==='touch')return;const r=el.getBoundingClientRect();el.style.setProperty('--pointer-x',(e.clientX-r.left)/r.width-.5);el.style.setProperty('--pointer-y',(e.clientY-r.top)/r.height-.5);});
      el.addEventListener('pointerleave',()=>{el.style.setProperty('--pointer-x',0);el.style.setProperty('--pointer-y',0);});
    });
  }

  render = function() {
    stopReplay();originalRender();document.body.dataset.scene=state.view;setupParallax();
    document.querySelectorAll('.activity-panel tbody tr').forEach((el,i)=>el.style.setProperty('--row-order',i));
  };
  const controls=document.createElement('div');controls.className='experience-controls';
  controls.innerHTML=`<button data-sound-toggle aria-pressed="false" title="Enable interface sounds"><span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i></span><span data-sound-label>Sound off</span></button><button data-motion-toggle aria-pressed="${experience.reduced}" aria-label="Reduce motion">${icon('spark')}<span data-motion-label>${experience.reduced?'Motion reduced':'Motion on'}</span></button>`;
  document.querySelector('.tabs').append(controls);
  document.body.classList.toggle('motion-reduced',experience.reduced);

  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-source],[data-orbit-reward],[data-open-selected],[data-instant-open],[data-turn-final],[data-replay-vault],[data-journey-step],[data-replay],[data-sound-toggle],[data-motion-toggle],[data-discover]');
    if(!button)return;
    if(button.dataset.source){setSource(button.dataset.source);return;}
    if(button.dataset.orbitReward!==undefined){selectOrbit(button.dataset.orbitReward);return;}
    if(button.hasAttribute('data-open-selected')){showReward(rewards[state.selectedReward].id);return;}
    if(button.hasAttribute('data-instant-open')){openVault(true);return;}
    if(button.hasAttribute('data-turn-final')){revealFinal();return;}
    if(button.hasAttribute('data-replay-vault')){cancelVault();prepareVault(experience.reward);return;}
    if(button.dataset.journeyStep!==undefined){selectMilestone(button.dataset.journeyStep);return;}
    if(button.hasAttribute('data-replay')){
      if(experience.replaying){stopReplay();selectMilestone(experience.milestone);return;}
      experience.replaying=true;selectMilestone(0,true);
      experience.replayTimer=setInterval(()=>{const last=accountRows().length-1;if(experience.milestone>=last){stopReplay();selectMilestone(last);return;}selectMilestone(experience.milestone+1,true);},experience.reduced?600:1500);return;
    }
    if(button.hasAttribute('data-sound-toggle')){experience.sound=!experience.sound;button.setAttribute('aria-pressed',String(experience.sound));button.querySelector('[data-sound-label]').textContent=soundIcon();tone('select');return;}
    if(button.hasAttribute('data-motion-toggle')){experience.reduced=!experience.reduced;document.body.classList.toggle('motion-reduced',experience.reduced);button.setAttribute('aria-pressed',String(experience.reduced));button.querySelector('[data-motion-label]').textContent=experience.reduced?'Motion reduced':'Motion on';return;}
    if(button.dataset.discover){const id=button.dataset.discover;if(id==='reward'){location.hash='store';document.querySelector('.reward-universe')?.scrollIntoView({behavior:experience.reduced?'instant':'smooth',block:'start'});}else if(state.view!=='overview'){location.hash='overview';setTimeout(()=>{document.querySelector(id==='source'?'.source-dock':'.journey-world')?.scrollIntoView({behavior:experience.reduced?'instant':'smooth',block:'center'});},80);}else document.querySelector(id==='source'?'.source-dock':'.journey-world')?.scrollIntoView({behavior:experience.reduced?'instant':'smooth',block:'center'});}
  });
  // Intercept account selection before the original compact journey handler.
  document.addEventListener('click',e=>{const button=e.target.closest('[data-account]');if(!button)return;e.stopImmediatePropagation();stopReplay();state.account=button.dataset.account;experience.milestone=accountRows().length-1;const section=document.querySelector('.journey-world');if(section)section.outerHTML=journeyView();tone('select');},true);
  document.addEventListener('input',e=>{if(e.target.matches('[data-journey-range]'))selectMilestone(e.target.value);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){experience.holding=false;stopReplay();}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')experience.holding=false;});
  window.addEventListener('hashchange',()=>{stopReplay();if(modal.open)closeModal();});
  render();
})();
