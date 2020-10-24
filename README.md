![Pixelcoulee Logo](https://siasky.net/AABLe6NEcRQSDcamGmncceJG0yMsFdtDMNQ0ghcqLyS5qQ)

# CleanTabs
CleanTabs is a minimal, efficient, vanilla JavaScript tabs plugin. Only 8KB total!

[CleanAccordion](https://github.com/jordanpinski/CleanAccordion) is a dependency for mobile functionality & is included by default.

## Try Some of My Other Plugins
- [CleanAccordion](https://github.com/jordanpinski/CleanAccordion)
- [CleanBackgroundVideo](https://github.com/jordanpinski/CleanBackgroundVideo)

## Installation
Include the CSS/JS in your HTML.

```
<link href="css/clean-tabs.min.css" type="text/css" rel="stylesheet" />
```
```
<script src='js/clean-tabs.min.js'></script>
```

## Basic Usage
Add the required HTML & initialize.
```
<div data-tab-group>

  <ul>
    <li data-button><a href="#" title="Tab 1">Tab 1</a></li>
    <li data-button><a href="#" title="Tab 2">Tab 2</a></li>
    <li data-button><a href="#" title="Tab 3">Tab 3</a></li>
  </ul>

  <div>
    <div data-content>
      <p>Content 1</p>
    </div>
    <div data-content>
      <p>Content 2</p>
    </div>
    <div data-content>
      <p>Content 3</p>
    </div>
  </div>

</div>
```
```
<script>

  const elements = document.querySelectorAll('[data-tab-group');
  const cleanTabs = new CleanBackgroundVideo(elements);

</script>
```


## API
### Constructor Arguments
The `new CleanTabs()` instruction you execute on your page can take two parameters:

| Parameter | What to pass | Required | Default value | Type |
| --------- | ------------ | -------- | ------------- | ---- |
| Element | The CleanTabs DOM element/s | Yes | `null` | Dom Element |
| Options | The option object for this instance of CleanTabs | No | `{}` | Plain Object |

### Options
For every instance of *CleanAccordion* you can pass in some options to alter the behavior.

| Name | Meaning | Default Value | Example Value |
| ---- | ------- | ------------- | ------------- |
| openFirst | What tab should open first | 0 | 1 |
| beforeOpen | A function that's called before a tab is opened | function(tab) {} | function(tab) {} |
| afterOpen | A function that's called after a tab is opened | function(tab) {} | function(tab) {} |
| beforeClose | A function that's called before a tab is closed | function(tab) {} | function(tab) {} |
| afterOpen | A function that's called after a tab is closed | function(tab) {} | function(tab) {} |