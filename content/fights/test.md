---
sections:
  - name: first section
    mechanics:
      - name: first mechanic
        effects:
          - name: aoe1
          - name: aoe1
            startDelay: 1000
      - name: second mechanic
        repeat: 1
        effects:
          - name: aoe1
            target: all

  - name: second section
    startDelay: 1000
    mechanics:
      - name: third mechanic
        effects:
          - name: aoe1
          - name: aoe1
            startDelay: 1000
      - name: fourth mechanic
        effects:
          - name: aoe1
            target: all
---

# A Test Fight
