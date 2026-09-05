# Group Listings for GLPI

Version 1.2.1 targets GLPI 11.0.x. It adds a **Group Listings** entry under
**Assets** and provides a selectable GLPI native list with optional,
Alloy-style grouping by any visible column.

The plugin does not alter GLPI core files and creates no database tables. It
uses GLPI's native `Search::show()` list, preserving
search criteria, sorting, configurable columns, massive actions and paging.
Grouping is applied to the rows on the current result page. Supported initial
listings include SIM Cards, Computers, Monitors, Network Equipment, Phones,
Licenses, Contracts, Suppliers, Lines, Users and Groups when the current user
has permission to view them.

Groups are collapsed by default whenever a list or result page is loaded.

## Columns

Columns are managed by GLPI's standard personal/global display preferences.
The **Group by** selector is populated from the columns visible in the current
list.

## Installation on the GLPI host

Extract the archive so the plugin directory is exactly:

    /opt/glpi/plugins/grouplistings

The container sees the same directory as:

    /var/www/glpi/plugins/grouplistings

Set the same ownership and permissions as the existing plugins, then install
and enable **Group Listings** from **Setup > Plugins**.

## Notes

GLPI stores SIM Cards as device components attached to assets. Therefore this
view lists rows from `glpi_items_devicesimcards`, grouped by the Entity on the
attachment record. A SIM Card that has not been attached to an asset does not
have an item row and cannot appear in this first version.
