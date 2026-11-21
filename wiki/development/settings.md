---
title: Settings framework
description: Add a setting or a screen without breaking search, backups, tablets or translations.
---

Settings are not hand-built rows. A modular framework wires a storage key to a UI row, so a preference has one source of truth and every screen can be searched. This page is the procedure and the traps.

## The layers

| Piece | Location | Role |
|---|---|---|
| `SettingKey<T>` | `core:common` (`tachiyomi.core.common.preference`) | Exact storage key + default |
| `*SettingKeys` object | Beside each `*Preferences` class | All keys one feature owns |
| `SettingDefinition<T>` | `settings/framework/` | Key + title + store binding + row builder |
| `*SettingsHost` | Beside the settings screen | The feature's definition list; self-registers for duplicate detection |
| `SettingRow` / `List.toItems` | `settings/framework/` | Definitions → `PreferenceItem` through the existing dispatcher |
| `GenericSettingsScreen` | `settings/framework/` | Base class for definition-driven screens; still searchable |
| `SettingsCatalog` | `settings/screen/` | The single searchable-screen list |

The renderer is still `PreferenceItem`. Framework rows look and behave exactly like hand-built ones. Non-standard rows (navigation, async data, login widgets) remain hand-built as escape hatches.

A second, unrelated system exists in `presentation-core`: `SettingsItems` (`HeadingItem`, `CheckboxItem`, `SliderItem`, `TriStateItem`, …). It is used by non-settings screens (library sort, source filters, the reader's appearance sheet) and takes raw `Preference<T>` objects. Do not confuse the two. Unify them only deliberately — they serve different hosts.

## Adding a setting

Three steps:

1. **Add the key** to the feature's `*SettingKeys` object. Apply `Preference.privateKey()` / `appStateKey()` here, not at call sites.
2. **Add one definition** to the feature's host: `switchSetting`, `editTextSetting`, `intSliderSetting`, `multiSelectSetting` or `listSetting`.
3. **Render it** by including it in the host list consumed by `toItems(store)` / `SettingRow`.

Keep the `*Preferences.foo()` accessor as a thin delegate over the same key. Screens, backup (`getAll()` keys) and DI (`globalAppGraph.*`) depend on it.

### Never rename a key without a migration

Backups match raw key strings. A rename needs a `mihon.core.migration.Migration` that rewrites the stored value, or restored libraries silently lose the setting.

## Adding a screen

1. Create a screen extending `GenericSettingsScreen(titleRes)` (or `SearchableSettings` directly if most rows are custom).
2. Build its groups from host definitions.
3. Register it in **both** `SettingsCatalog.searchableScreens` (the search index) and `SettingsMainScreen.items` (the hub icon and subtitle).

Missing either list breaks something silently: the screen is unreachable, or unsearchable. There is no compile-time check.

### Search

The settings hub has a search row. The index covers every registered screen — Discord, webhooks, achievements, the MTL sub-screens and the launcher identity screen included. It matches screen titles, group headings, row titles and summaries, searches all words in any order ("black theme" finds the AMOLED switch), and does not stop at ten results.

## Parity rules

Regressions live here:

- `editText` / `list` / `multiSelect` helpers default their subtitle to `"%s"` (the value preview), matching the hand-built data-class defaults. Do not "clean up" that fallback.
- `toItems` uses a plain `for` loop. `@Composable` builders cannot be called inside `map {}`.
- Keep item order identical to the screen being migrated; search matches on title text.
- The framework must never assume the default SharedPreferences file. Source preferences (`source_$id`) are outside it by design.

## Tablet two-pane navigation

On a tablet, the settings hub is the left pane and the top back-stack entry is the right one (`TwoPaneSettingsScene` in `core/navigation`).

The hub's row handler in `ui/setting/SettingsScreen.kt` **pops everything above the hub and then opens the row**. Replacing only the top entry stranded the previous section in the stack, and the duplicate guard then matched the route being returned to, making the row a dead tap until the user left settings entirely.

Any new settings entry point must go through that helper. Adding rows with a bare `backStack.add(route)` reintroduces the dead row.

## Backup interaction

`PreferenceBackupCreator` snapshots `store.getAll()`. That means:

- every framework key is backed up automatically;
- `__APP_STATE_` is always dropped;
- `__PRIVATE_` is included only when the user opts in;
- category-id keys are remapped by `PreferenceRestorer`;
- `LibraryPreferences` and `DownloadPreferences` category key sets are special-cased;
- `SourcePreferences.PINNED_SOURCES_PREF_KEY` is special-cased.

If you add a preference whose value references a category or source id, check whether the restorer needs to remap it.

## Translation

Hyoukan-specific strings use `KMR` from `i18n-kmk`, not `MR`. The base locale is the only one edited in the repository; Weblate owns translations. A new row needs a title and, where it has one, a summary — both translated.

## Checklist for a new setting

- [ ] Key in the right `*SettingKeys` object.
- [ ] Default is the value a new user should get.
- [ ] Accessor delegates to the key.
- [ ] Host definition added.
- [ ] Row rendered.
- [ ] Backup behaviour considered (private? category id?).
- [ ] Strings in `KMR` if Hyoukan-only.
- [ ] Search finds it by title and summary.
- [ ] Tablet two-pane navigation still works.
- [ ] A test covers the behaviour the setting controls (or a harness, if it is policy).
