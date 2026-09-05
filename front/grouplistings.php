<?php

include '../../../inc/includes.php';

require_once dirname(__DIR__) . '/inc/grouplisting.class.php';

$listings = PluginGrouplistingsGrouplisting::getAvailableListings();
$allowedItemtypes = [];
foreach ($listings as $items) {
    $allowedItemtypes = array_merge($allowedItemtypes, array_keys($items));
}

$defaultItemtype = Item_DeviceSimcard::class;
$requestedItemtype = (string) ($_GET['itemtype'] ?? $defaultItemtype);
$itemtype = in_array($requestedItemtype, $allowedItemtypes, true)
    ? $requestedItemtype
    : $defaultItemtype;

if (!in_array($itemtype, $allowedItemtypes, true)) {
    Html::displayErrorAndDie(__('You do not have permission to perform this action.'));
}

$item = new $itemtype();

Html::header(
    PluginGrouplistingsGrouplisting::getTypeName(),
    $_SERVER['PHP_SELF'],
    'assets',
    PluginGrouplistingsGrouplisting::class
);

echo '<div class="grouplistings-toolbar px-3 pt-3"'
    . ' data-entity-label="' . htmlspecialchars(__('Entity'), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '"'
    . ' data-itemtype="' . htmlspecialchars($itemtype, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '">';
echo '<div class="d-flex flex-wrap align-items-end gap-2">';

echo '<label class="form-label mb-0"><span class="d-block small text-secondary mb-1">'
    . __('Listing', 'grouplistings') . '</span>';
echo '<select class="form-select form-select-sm" data-ga-listing>';
foreach ($listings as $category => $items) {
    echo '<optgroup label="' . htmlspecialchars($category, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '">';
    foreach ($items as $type => $label) {
        echo '<option value="' . htmlspecialchars($type, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '"'
            . ($type === $itemtype ? ' selected' : '') . '>'
            . htmlspecialchars($label, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</option>';
    }
    echo '</optgroup>';
}
echo '</select></label>';

echo '<label class="form-label mb-0"><span class="d-block small text-secondary mb-1">'
    . __('Group by', 'grouplistings') . '</span>';
echo '<select class="form-select form-select-sm" data-ga-group-field disabled>';
echo '<option value="">' . __('Loading columns…', 'grouplistings') . '</option>';
echo '</select></label>';

echo '<div class="btn-list mb-0">';
echo '<button type="button" class="btn btn-primary btn-sm" data-ga-action="group" aria-pressed="true">';
echo '<i class="ti ti-folders me-1"></i>' . __('Grouping on', 'grouplistings') . '</button>';
echo '<button type="button" class="btn btn-outline-secondary btn-sm" data-ga-action="expand">'
    . __('Expand all', 'grouplistings') . '</button>';
echo '<button type="button" class="btn btn-outline-secondary btn-sm" data-ga-action="collapse">'
    . __('Collapse all', 'grouplistings') . '</button>';
echo '</div>';
echo '<span class="text-secondary small mb-1" data-ga-status></span>';
echo '</div></div>';

echo '<div class="grouplistings-search-host">';
Search::show($itemtype);
echo '</div>';

Html::footer();
