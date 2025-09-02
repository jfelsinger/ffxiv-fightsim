---
title: '[Tutorial] Creating/Using Virtual Menus in FFXIV'
description: Not an update, but a steam controller configuration journey.
datetime: 2024-11-19 20:50
---

This isn't really an update, but a quick tutorial for setting
up virtual menus in Steam, to make using a controller that much more cooler.

---

If you've not seen them, this scuffed a.f. example picture shows how Steam's virtual menus can look in game:

<details class="collapse bg-base-300 my-2">
    <summary class="collapse-title text-xl font-medium" style="display: flex; align-items: center; gap: 0.325em;">
        <Icon name="solar:camera-linear" size="1.25em"></Icon>
        An example of a virtual menu for FFXIV
    </summary>
    <div class="collapse-content">
        <img src="/images/steam-quick-menu/scuffed-example.png" />
    </div>
</details>

Using a virtual menu, you can make it simple to open/close any windows in FFXIV that have a keybind for them, the same
as one might with mouse and keyboard controls, but done simply with your controller.

## Step 1, Make a Virtual Menu

Inside Steam, whether in Steam Deck, Big Picture, or on regular desktop Steam, start by bringing up your current
controller layout and go to "Edit Layout"

<details class="collapse bg-base-300 my-2">
    <summary class="collapse-title text-xl font-medium" style="display: flex; align-items: center; gap: 0.325em;">
        <Icon name="solar:camera-linear" size="1.25em"></Icon>
        Edit Layout
    </summary>
    <div class="collapse-content">
        <img src="/images/steam-quick-menu/s1-create-virtual-menu-1.png" />
    </div>
</details>

Once you're editing your controller layout, you should have a window like the following.

1. Navigate to "Virtual Menus"
2. and "Add Virtual Menu"

You will be given a prompt to name the menu. The name won't affect the menu's UI in game, and you can change it later,
so call it whatever you want.

As well, you will be given the option for what style of menu it will be. I prefer radial menus, but go with whatever you
want, the next steps are the same regardless, it's just the layout on your screen that will change.

<details class="collapse bg-base-300 my-2">
    <summary class="collapse-title text-xl font-medium" style="display: flex; align-items: center; gap: 0.325em;">
        <Icon name="solar:camera-linear" size="1.25em"></Icon>
        Add Virtual Menu
    </summary>
    <div class="collapse-content">
        <img src="/images/steam-quick-menu/s1-create-virtual-menu-2.png" />
    </div>
</details>

Once you have created and named your Virtual Menu, hit the pencil to actually go in and start adding commands to it.

<details class="collapse bg-base-300 my-2">
    <summary class="collapse-title text-xl font-medium" style="display: flex; align-items: center; gap: 0.325em;">
        <Icon name="solar:camera-linear" size="1.25em"></Icon>
        Hit the pencil
    </summary>
    <div class="collapse-content">
        <img src="/images/steam-quick-menu/s1-create-virtual-menu-3.png" />
    </div>
</details>

## Step 2, Add Menu Entries

Once in the interface for editing your Virtual Menu, you can start adding options to it:

<details class="collapse bg-base-300 my-2">
    <summary class="collapse-title text-xl font-medium" style="display: flex; align-items: center; gap: 0.325em;">
        <Icon name="solar:camera-linear" size="1.25em"></Icon>
        Add Virtual Menu Entry
    </summary>
    <div class="collapse-content">
        <img src="/images/steam-quick-menu/s2-add-menu-entry-1.png" />
    </div>
</details>

When you select the menu entry in game, it will perform whatever action you set it up to do. That can be a keybind,
gamepad button binding, changing something in your steam config, etc.

For this example, we'll want the menu entry to open the "Crafting Log," which is bound to the key N.

<details class="collapse bg-base-300 my-2">
    <summary class="collapse-title text-xl font-medium" style="display: flex; align-items: center; gap: 0.325em;">
        <Icon name="solar:camera-linear" size="1.25em"></Icon>
        Select Keyboard Binding
    </summary>
    <div class="collapse-content">
        <img src="/images/steam-quick-menu/s2-add-menu-entry-2.png" />
    </div>
</details>

Once you select your keyboard binding, it will create the entry.

From there the entry is in place, but you might want to hit the gear and rename how the entry shows in the menu, or add
a custom icon.

<details class="collapse bg-base-300 my-2">
    <summary class="collapse-title text-xl font-medium" style="display: flex; align-items: center; gap: 0.325em;">
        <Icon name="solar:camera-linear" size="1.25em"></Icon>
        Setup the rest of the menu entry.
    </summary>
    <div class="collapse-content">
        <img src="/images/steam-quick-menu/s2-add-menu-entry-3.png" />
        <img src="/images/steam-quick-menu/s2-add-menu-entry-4.png" />
        <img src="/images/steam-quick-menu/s2-add-menu-entry-5.png" />
        <img src="/images/steam-quick-menu/s2-add-menu-entry-6.png" />
    </div>
</details>

## Step 3, Setting up a more complex command (CTRL + U)

Some keybinds in FFXIV need multiple keypresses, such as holding Ctrl and pressing another key, for them to work.

You might have noticed that when we add a keybind, it only adds the one.

This is an easy enough fix with "Add sub command."

For something like the FFXIV "Timers" window, which uses Ctrl+U as a keybind by default:

1. Setup and create a new menu entry like before, make the keybind your `CTRL` key.
2. Hit that gear, and "Add sub command"

You'll then add the keypress binding for the `U` key.

<details class="collapse bg-base-300 my-2">
    <summary class="collapse-title text-xl font-medium" style="display: flex; align-items: center; gap: 0.325em;">
        <Icon name="solar:camera-linear" size="1.25em"></Icon>
        Add Sub Command
    </summary>
    <div class="collapse-content">
        <img src="/images/steam-quick-menu/s3-add-complex-menu-entry-1.png" />
    </div>
</details>

When you're done, your entries can look something like the following:

<details class="collapse bg-base-300 my-2">
    <summary class="collapse-title text-xl font-medium" style="display: flex; align-items: center; gap: 0.325em;">
        <Icon name="solar:camera-linear" size="1.25em"></Icon>
        Finished multi-key entry
    </summary>
    <div class="collapse-content">
        <img src="/images/steam-quick-menu/s3-add-complex-menu-entry-2.png" />
    </div>
</details>

Once you've added menu entries for all the commands you want to have in your menu,
you can setup how you want to activating the menu entries in game to work.

I use the Steamdeck's touchpad for my menus, so I like to set the "Radial Menu Button Type" to "Click."

<details class="collapse bg-base-300 my-2">
    <summary class="collapse-title text-xl font-medium" style="display: flex; align-items: center; gap: 0.325em;">
        <Icon name="solar:camera-linear" size="1.25em"></Icon>
        Radial Menu Button Type
    </summary>
    <div class="collapse-content">
        <img src="/images/steam-quick-menu/s4-set-button-type.png" />
    </div>
</details>

## Step 4, Actually Use the Menu

On Steam Deck, I set this to one of the touchpads that I would otherwise not be using.

If you head to the configuration section for your trackpad, and choose behavior, your newly created Virtual Menu should
show up in there as an option.

---

IF you don't have an extra unused joystick/trackpad/etc, you can still make use of a Virtual Menu, it just becomes a tad
more complicated, because you'll probably set up a keybind and control layer to switch a joystick/trackpad to activating
the menu. (Something like R Trigger + R Bumper turning L Joystick into a menu)

I'll upload more images for this later, in a part 2.

<!--
![Step 1, part 1](/images/steam-quick-menu/s1-create-virtual-menu-1.png)
![Step 1, part 2](/images/steam-quick-menu/s1-create-virtual-menu-2.png)
![Step 1, part 3](/images/steam-quick-menu/s1-create-virtual-menu-3.png)

![Step 2, part 1](/images/steam-quick-menu/s2-add-menu-entry-1.png)
![Step 2, part 2](/images/steam-quick-menu/s2-add-menu-entry-2.png)
![Step 2, part 3](/images/steam-quick-menu/s2-add-menu-entry-3.png)
![Step 2, part 4](/images/steam-quick-menu/s2-add-menu-entry-4.png)
![Step 2, part 5](/images/steam-quick-menu/s2-add-menu-entry-5.png)
![Step 2, part 6](/images/steam-quick-menu/s2-add-menu-entry-6.png)

![Step 3, part 1](/images/steam-quick-menu/s3-add-complex-menu-entry-1.png)
![Step 3, part 2](/images/steam-quick-menu/s3-add-complex-menu-entry-2.png)

![Step 4](/images/steam-quick-menu/s4-set-button-type.png)
-->
