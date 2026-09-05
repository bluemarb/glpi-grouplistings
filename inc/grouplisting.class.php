<?php

class PluginGrouplistingsGrouplisting extends CommonGLPI
{
    public static $rightname = 'device';

    public static function getTypeName($nb = 0): string
    {
        return __('Group Listings', 'grouplistings');
    }

    public static function getMenuName(): string
    {
        return __('Group Listings', 'grouplistings');
    }

    public static function getMenuContent(): array
    {
        return [
            'title' => self::getMenuName(),
            'page'  => '/plugins/grouplistings/front/grouplistings.php',
            'icon'  => 'ti ti-folders',
        ];
    }

    public static function canView(): bool
    {
        return Session::haveRight(self::$rightname, READ);
    }

    public static function getAvailableListings(): array
    {
        $definitions = [
            __('Assets') => [
                Item_DeviceSimcard::class => __('SIM Cards', 'grouplistings'),
                Computer::class           => Computer::getTypeName(Session::getPluralNumber()),
                Monitor::class            => Monitor::getTypeName(Session::getPluralNumber()),
                NetworkEquipment::class   => NetworkEquipment::getTypeName(Session::getPluralNumber()),
                Phone::class              => Phone::getTypeName(Session::getPluralNumber()),
            ],
            __('Management') => [
                SoftwareLicense::class => SoftwareLicense::getTypeName(Session::getPluralNumber()),
                Contract::class        => Contract::getTypeName(Session::getPluralNumber()),
                Supplier::class        => Supplier::getTypeName(Session::getPluralNumber()),
                Line::class            => Line::getTypeName(Session::getPluralNumber()),
            ],
            __('Administration') => [
                User::class  => User::getTypeName(Session::getPluralNumber()),
                Group::class => Group::getTypeName(Session::getPluralNumber()),
            ],
        ];

        $available = [];
        foreach ($definitions as $category => $itemtypes) {
            foreach ($itemtypes as $itemtype => $label) {
                if (!class_exists($itemtype)) {
                    continue;
                }
                $item = new $itemtype();
                if ($item->canView()) {
                    $available[$category][$itemtype] = $label;
                }
            }
        }

        return $available;
    }
}
