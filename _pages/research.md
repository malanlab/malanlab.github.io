---
layout: default
title: Research
permalink: /research/
---

# Research

## 🧠 Can brain rhythms explain and predict chronic pain?

<div class="research-block">

  <!-- TEXT SIDE -->
  <div class="card">

    <h3>The problem</h3>
    <p>
      Chronic pain is not only a symptom of injury—it also reflects how the brain processes and amplifies pain signals.
      Many studies show changes in brain rhythms, especially in the alpha band (8–12 Hz), but we still do not fully understand:
      <b>which brain regions change, and how these changes relate to how much pain a person feels.</b>
    </p>

    <h3>Our approach</h3>
    <p>
      We study whether brain signals such as <b>Peak Alpha Frequency (PAF)</b> and alpha power can act as measurable biomarkers of pain.
      We also relate these brain features to subjective pain intensity across individuals.
    </p>

    <h3>What we studied</h3>
    <ul>
      <li>Resting-state MEG recordings from CRPS patients and healthy controls</li>
      <li>Peak Alpha Frequency (PAF) — speed of dominant brain rhythm</li>
      <li>Alpha-band power across cortical regions</li>
      <li>Functional connectivity within pain-related brain networks</li>
      <li>Relationship between brain signals and reported pain severity</li>
    </ul>

  </div>

  <!-- IMAGE SIDE -->
  <div class="research-media">

    <div class="mini-carousel">

      <img class="active" src="{{ '/assets/images/research/crps_brain.png' | relative_url }}">
      <img src="{{ '/assets/images/research/crps_corr.png' | relative_url }}">
      <img src="{{ '/assets/images/research/alpha_connectivity.png' | relative_url }}">

    </div>

  </div>

</div>

---

<div class="grid">

  <div class="card">
    <h3>What we found</h3>
    <ul>
      <li>Brain rhythms slow down in chronic pain (reduced PAF)</li>
      <li>Alpha power decreases in key sensory and association areas</li>
      <li>Changes are strongest in regions involved in body representation and attention to pain</li>
      <li>Pain severity is linked to abnormal activity in prefrontal and orbitofrontal regions</li>
    </ul>
  </div>

  <div class="card">
    <h3>What it means</h3>
    <ul>
      <li>Posterior brain regions reflect how sensory pain is processed</li>
      <li>Prefrontal and orbitofrontal cortex contribute to how unpleasant pain feels</li>
      <li>Altered connectivity suggests the brain may get “stuck” in persistent pain states</li>
    </ul>
  </div>

</div>

---

<div class="card">

  <h3>Big picture: towards predictive pain neuroscience</h3>

  <p>
    Our long-term goal is to move beyond describing brain differences and build a <b>normative model of brain activity</b>.
  </p>

  <p>
    By learning what “typical” brain activity looks like from large EEG/MEG datasets, we can measure how much each individual deviates from this norm.
    These deviations may help us:
  </p>

  <ul>
    <li>Predict pain severity from brain activity</li>
    <li>Identify early neural markers of chronic pain</li>
    <li>Support diagnosis of neuropathic pain conditions</li>
    <li>Guide personalized neuromodulation and rehabilitation strategies</li>
  </ul>

  <p>
    In simple terms: <b>we aim to turn brain rhythms into a predictive tool for understanding and treating pain.</b>
  </p>

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
