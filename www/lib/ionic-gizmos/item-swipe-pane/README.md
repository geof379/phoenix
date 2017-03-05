# item-swipe-pane

`item-swipe-pane` is element directive which creates a container inside a `ion-item`, which is visible when the item is swiped to the left or to the right.

Attribute `direction` controls swipe direction. Possible values are `left` or `right`. Default direction is left.

You can place any content it the directive, button, text, image, icon, avatar, background image, etc.  

The container is quite raw in a sense that everything you place in it has to be formatted by CSS or by other means.

`item-swipe-pane` is compatible with `ion-option-button`, `ion-delete-button` and `ion-reorder-button` directives.

It is possible to combine two `item-swipe-pane`s on the same `ion-item`. Each one with different swipe directio.

## Examples

Example with two item-swipe-panes, one is on the left and one on the right:

    <ion-item>
      Two item-swipe-panes. One on the left, one on the right.
      <item-swipe-pane direction="right">
        <button class="button button-balanced ion-arrow-right-c"></button>
        <button class="button button-positive">Update</button>
        <button class="button button-royal">Add</button>
      </item-swipe-pane>

      <item-swipe-pane class="left-pane">
        <button class="button button-assertive">Delete</button>
        <button class="button button-calm">Share</button>
        <button class="button button-balanced ion-arrow-left-c"></button>
      </item-swipe-pane>
    </ion-item>

![alt text](https://raw.githubusercontent.com/MichalFoksa/ionic-gizmos/master/img/item-swipe-pane-example1.gif "item-swipe-pane examples")

More [item-swipe-pane examples](http://codepen.io/MichalFoksa/pen/qaNKdP) are on Codepen.

## Important note

Unfortunately `Ionic Framework` does not allow right swipe (from left to right) of a list item, so I had to make few modifications to the `Ionic` library. As a base I used Ionic 1.3.1.
 - [Modified Ionic 1.3.1 framework](https://github.com/MichalFoksa/ionic-gizmos/tree/master/ionic).
 - [Summary of modifications in Ionic][1].

## Like it?

Give it a vote on [StackOverflow][2].

  [1]: https://github.com/MichalFoksa/ionic-gizmos/compare/1d6d2be3ff309bb72347805e4bf0d18b47be2bef...c6e4e3d9b077090643845691a393840756ff6f64#diff-87609cead09086a19f67299e0a41effc
  [2]: http://stackoverflow.com/questions/31153543/ionic-how-to-swipe-from-left-to-right-ionic-list-item/39545812#39545812
