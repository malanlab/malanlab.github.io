---
layout: default
title: Research
permalink: /research/
---

# Research

---

## 🧠 Which cortical oscillatory features and brain regions are associated with chronic pain severity? 

<div class="research-block">

  <!-- TEXT SIDE -->
  <div class="card">

    <h3>Problem</h3>
    <p>
      Chronic pain is associated with abnormal cortical rhythms, particularly in the alpha band (8–12 Hz).
      However, how peak alpha frequency (PAF) and alpha power change across brain regions,
      and how they relate to pain severity, remains unclear.
    </p>

    <h3>What we studied</h3>
    <ul>
      <li>Resting-state MEG in CRPS patients and healthy controls</li>
      <li>Peak alpha frequency (PAF)</li>
      <li>Alpha-band power across cortex</li>
      <li>Functional connectivity in alpha networks</li>
      <li>Relation with subjective pain severity</li>
    </ul>

  </div>

  <!-- IMAGE SIDE -->
<div class="research-media">

  <div class="mini-carousel">

    <img class="active" src="{{ '/assets/images/research/crps_brain.png' | relative_url }}">
    <img src="{{ '/assets/images/research/alpha_connectivity.png' | relative_url }}">

  </div>

  <p class="img-caption">
    Cortical alpha alterations in chronic pain (MEG source-space mapping)
  </p>

</div>

</div>


<div class="grid">

  <div class="card">
    <h3>Key findings</h3>
    <ul>
      <li>CRPS shows global slowing of peak alpha frequency (PAF)</li>
      <li>Reduced alpha power in precuneus, paracentral, superior parietal cortex</li>
      <li>Pain severity correlates with PFC and OFC alpha disruption</li>
      <li>Increased alpha connectivity in PFC–OFC networks</li>
    </ul>
  </div>

  <div class="card">
    <h3>Interpretation</h3>
    <ul>
      <li>Posteromedial cortex → sensory processing</li>
      <li>Prefrontal / OFC → pain intensity encoding</li>
      <li>Network hyperconnectivity → maladaptive affect integration</li>
    </ul>
  </div>

</div>

## ⚡ How does the human cerebellum interact with cortex during motor error processing?

<div class="card" markdown="1">

### Problem
The cerebellum is essential for motor learning and error correction, but its real-time interaction with cortex in humans is still unclear.

### What we study
We use:

- EEG / MEG recordings  
- Motor error paradigms  
- Connectivity analysis  
- Computational modeling  

### Key questions
- How does cerebellum send error signals to cortex?
- Which cortical regions encode motor updates?
- How does learning reshape these circuits?

### Interpretation
Cerebello–cortical loops support:

- Error detection  
- Motor adaptation  
- Learning-driven updating  

</div>

---

## 🚶 How does cortico–subcortical network dysfunction lead to freezing of gait in Parkinson’s disease?

<div class="card" markdown="1">

### Problem
Freezing of gait (FOG) is caused by transient motor block, but its network mechanism is unclear.

### What we study
We use:

- EEG + LFP recordings  
- DBS data  
- Motor paradigms  
- Beta burst / connectivity analysis  

### Key hypotheses
- FOG = cortico–basal ganglia disconnection
- Beta bursts reflect unstable motor switching
- DBS restores network dynamics

### Interpretation
FOG reflects a **network failure of motor state transitions** across cortical and subcortical circuits.

</div>


<script>
function startMiniCarousels() {

  document.querySelectorAll(".mini-carousel").forEach(carousel => {

    const imgs = carousel.querySelectorAll("img");
    let index = 0;

    if (imgs.length <= 1) return;

    setInterval(() => {

      imgs[index].classList.remove("active");
      index = (index + 1) % imgs.length;
      imgs[index].classList.add("active");

    }, 2500);

  });

}

document.addEventListener("DOMContentLoaded", startMiniCarousels);
</script>
