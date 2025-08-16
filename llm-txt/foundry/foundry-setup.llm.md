---
description: Quick start guide to using Foundry's four essential tools - Forge, Anvil, Cast, and Chisel for smart contract development.
---

## Getting Started

Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust. It consists of four essential tools that suffice all the needs a blockchain app developer will ever have.

Here's an overview of the tools available at your disposal after [running foundryup](/introduction/installation#using-foundryup):

| Tool                             | What it enables                                                     |
| -------------------------------- | ------------------------------------------------------------------- |
| **[`forge`](/forge/overview)**   | Build, test, debug, deploy and verify smart contracts               |
| **[`anvil`](/anvil/overview)**   | Run a local Ethereum development node with forking capabilities     |
| **[`cast`](/cast/overview)**     | Interact with contracts, send transactions, and retrieve chain data |
| **[`chisel`](/chisel/overview)** | Fast Solidity REPL for rapid prototyping and debugging              |

:::tip
You can always view detailed help for any command or subcommand by appending `--help` to it.
:::

---

### Forge

Forge is a command-line tool for building, testing, and deploying smart contracts.

#### Initialize a new project

```bash
# Create a new project called Counter
forge init Counter
cd Counter
```

#### Build and test contracts

```bash
# Compile your contracts
forge build

# Run your test suite
forge test

# Run tests against live chain state by forking
forge test --fork-url https://reth-ethereum.ithaca.xyz/rpc
```

#### Deploy contracts

```bash
# Use forge scripts to deploy contracts
# Set your private key
export PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Deploy to local anvil instance
forge script script/Counter.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key $PRIVATE_KEY
```

`forge` also enables more advanced workflows such as:

- [Table testing](/forge/advanced-testing/table-testing) - Property-based testing with test cases inputs organized into a table format
- [Fuzz testing](/forge/advanced-testing/fuzz-testing) - Property-based testing with randomized inputs
- [Invariant testing](/forge/advanced-testing/invariant-testing) - Test system-wide properties across function call sequences
- [Gas tracking](/forge/gas-tracking/overview) - Monitor and optimize gas consumption across your contracts
- [Coverage reports](/forge/reference/forge-coverage) - Generate detailed test coverage analysis with `forge coverage`

Learn more about `forge` [here](/forge/overview).

---

### Anvil

Anvil is a fast local Ethereum development node that is perfect for testing your contracts and other blockchain workflows in a controlled environment.

#### Start a local development node

```bash
# Start anvil with 10 pre-funded accounts
anvil
```

#### Fork mainnet state

```bash
# Fork latest mainnet state for testing
anvil --fork-url https://reth-ethereum.ithaca.xyz/rpc
```

`anvil` comes up with other advanced capabilities such as:

- **Custom `anvil_` methods** - Advanced node control including [account impersonation](/anvil/reference#anvil_impersonateaccount), [state manipulation](/anvil/reference#anvil_setbalance), and [mining control](/anvil/reference#anvil_mine)
- **Forking capabilities** - Fork anvil off another live chain

All of the above is provided while maintaining full compliance with the Ethereum JSON-RPC spec.

Learn more about `anvil` [here](/anvil/overview).

### Cast

Cast is your Swiss army knife for interacting with Ethereum applications from the command line. You can make smart contract calls, send transactions, or retrieve any type of chain data.

#### Read contract data

```bash
# Check ETH balance
cast balance vitalik.eth --ether --rpc-url https://reth-ethereum.ithaca.xyz/rpc

# Call a contract function to read data
cast call 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 \
"balanceOf(address)" 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 \
--rpc-url https://reth-ethereum.ithaca.xyz/rpc
```

#### Send transactions

```bash
# Set your private key
export PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Send ETH to an address
cast send 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --value 10000000 --private-key $PRIVATE_KEY
```

#### Interact with JSON-RPC

```bash
# Call JSON-RPC methods directly
cast rpc eth_getHeaderByNumber $(cast 2h 22539851) --rpc-url https://reth-ethereum.ithaca.xyz/rpc

# Get latest block number
cast block-number --rpc-url https://reth-ethereum.ithaca.xyz/rpc
```

Learn more about `cast` [here](/cast/overview).

---

### Chisel

Chisel is a fast, utilitarian, and verbose Solidity REPL for rapid prototyping and debugging. It's perfect for testing Solidity snippets and exploring contract behavior interactively.

#### Start the REPL

```bash
# Launch chisel REPL
chisel
```

#### Interactive Solidity development

```solidity
// Create and query variables
➜ uint256 a = 123;
➜ a
Type: uint256
├ Hex: 0x7b
├ Hex (full word): 0x000000000000000000000000000000000000000000000000000000000000007b
└ Decimal: 123

// Test contract functions
➜ function add(uint256 x, uint256 y) pure returns (uint256) { return x + y; }
➜ add(5, 10)
Type: uint256
└ Decimal: 15
```

Learn more about `chisel` [here](/chisel/overview).

---
description: Initialize a new Foundry project using forge init with default templates and project structure.
---

## Creating a New Project

To start a new project with Foundry, use [`forge init`](/forge/reference/forge-init):

```sh
// [!include ~/snippets/output/hello_foundry/forge-init:command]
```

This creates a new directory `hello_foundry` from the default template. This also initializes a new `git` repository.

If you want to create a new project using a different template, you would pass the `--template` flag, like so:

```sh
forge init --template https://github.com/foundry-rs/forge-template hello_template
```

For now, let's check what the default template looks like:

```sh
cd hello_foundry
```

```sh
// [!include ~/snippets/output/hello_foundry/tree:all]
```

The default template comes with one dependency installed: Forge Standard Library. This is the preferred testing library used for Foundry projects. Additionally, the template also comes with an empty starter contract and a simple test.

Let's build the project:

```sh
// [!include ~/snippets/output/hello_foundry/forge-build:all]
```

And run the tests:

```sh
// [!include ~/snippets/output/hello_foundry/forge-test:all]
```

You'll notice that two new directories have popped up: `out` and `cache`.

The `out` directory contains your contract artifact, such as the ABI, while the `cache` is used by `forge` to only recompile what is necessary.

---
description: Clone verified on-chain contracts as Foundry projects with source code and metadata using forge clone.
---

## Clone a Verified Contract

To clone an on-chain verified contract as a Forge project, use [`forge clone`](/forge/reference/forge-clone), say [WETH9](https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2) on Ethereum mainnet:

```sh
// [!include ~/snippets/clone_contract/forge-clone:command]
```

This creates a new directory `WETH9`, configures it as a foundry project and clones all the source code of the contract into it. This also initializes a new `git` repository.

```sh
// [!include ~/snippets/clone_contract/forge-clone:output]
```

The cloned Forge project comes with an additional `.clone.meta` metadata file besides those ordinary files that a normal Forge project has.

Let's see what the `.clone.meta` file looks like:

```sh
// [!include ~/snippets/clone_contract/clone-meta:output]
```

`clone.meta` is a compact JSON data file that contains the information of the on-chain contract instance, e.g., contract address, constructor arguments, etc. More details of the metadata can be found in the [reference](/forge/reference/forge-clone).

---
description: Manage smart contract dependencies with git submodules, remappings, and package installation in Foundry projects.
---

## Dependencies

Forge manages dependencies using [git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) by default, which means that it works with any GitHub repository that contains smart contracts.

### Adding a dependency

To add a dependency, run [`forge install`](/forge/reference/forge-update):

```sh
// [!include ~/snippets/output/hello_foundry/forge-install:all]
```

This pulls the `solady` library, stages the `.gitmodules` file in git and makes a commit with the message `Installed solady`.

If we now check the `lib` folder:

```sh
// [!include ~/snippets/output/hello_foundry/tree:all]
```

We can see that Forge installed `solady`!

By default, `forge install` installs the latest master branch version. If you want to install a specific tag or commit, you can do it like so:

```sh
forge install vectorized/solady@v0.1.3
```

### Remapping dependencies

Forge can remap dependencies to make them easier to import. Forge will automatically try to deduce some remappings for you:

```sh
// [!include ~/snippets/output/hello_foundry/forge-remappings:all]
```

These remappings mean:

- To import from `forge-std` we would write: `import "forge-std/Contract.sol";`
- To import from `solady` we would write: `import "solady/Contract.sol";`

You can customize these remappings by creating a `remappings.txt` file in the root of your project.

Let's create a remapping called `solady-utils` that points to the `utils` folder in the `solady` repository!

```sh
@solady-utils/=lib/solady/src/utils/
```

You can also set remappings in `foundry.toml`.

```toml
remappings = [
    "@solady-utils/=lib/solady/src/utils/",
]
```

Now we can import any of the contracts in `src/utils` of the `solady` repository like so:

```solidity
import {LibString} from "@solady-utils/LibString.sol";
```

### Remapping conflicts

In some cases, you may encounter dependency conflicts when two or more git submodules include different dependencies with the same namespace. For example, suppose you have installed both `org/lib_1` and `org/lib_2`, and they each reference their own versions of `@openzeppelin`. In such scenarios, `forge remappings` generates a single remapping entry for the namespace, which will point to only one of the two `@openzeppelin` libraries.

```sh
forge remappings
@openzeppelin/=lib/lib_1/node_modules/@openzeppelin/
```

This situation can lead to import issues, causing `forge build` to fail or introduce unexpected behavior into your contracts. To resolve this, you can add remapping contexts to your `remappings.txt` file. This instructs the compiler to use different remappings in distinct compilation contexts, resolving the conflict. For example, to address the conflict between `lib_1` and `lib_2`, you would update your remappings.txt as follows:

```sh
lib/lib_1/:@openzeppelin/=lib/lib_1/node_modules/@openzeppelin/
lib/lib_2/:@openzeppelin/=lib/lib_2/node_modules/@openzeppelin/
```

This approach ensures that each dependency is mapped to the appropriate library version, avoiding potential issues. For more information about remapping, please see the [Solidity Lang Docs](https://docs.soliditylang.org/en/latest/path-resolution.html#import-remapping).

### Updating dependencies

You can update a specific dependency to the latest commit on the version you have specified using [`forge update <dep>`](/forge/reference/forge-update). For example, if we wanted to pull the latest commit from our previously installed master-version of `solady`, we would run:

```sh
forge update lib/solady
```

Alternatively, you can do this for all dependencies at once by just running `forge update`.

### Removing dependencies

You can remove dependencies using [`forge remove <deps>...`](/forge/reference/forge-remove), where `<deps>` is either the full path to the dependency or just the name. For example, to remove `solady` both of these commands are equivalent:

```sh
forge remove solady
# ... is equivalent to ...
forge remove lib/solady
```

### Hardhat compatibility

Forge also supports Hardhat-style projects where dependencies are npm packages (stored in `node_modules`) and contracts are stored in `contracts` as opposed to `src`.

To enable Hardhat compatibility mode pass the `--hh` flag.

---
description: Use Soldeer as a native Solidity package manager for managing dependencies with central repository and git support.
---

## Soldeer as a Package Manager

As explained [here](./dependencies), Foundry has been using git submodules to handle dependencies up until now.

The need for a native package manager started to emerge as projects became more complex.

A new approach has been in the making, [soldeer.xyz](https://soldeer.xyz), which is a Solidity native dependency manager built in Rust and open sourced (check the repository [https://github.com/mario-eth/soldeer](https://github.com/mario-eth/soldeer)).

#### If you want to see the full commands and usage of Soldeer, you can visit the [USAGE.md](https://github.com/mario-eth/soldeer/blob/main/USAGE.md).

### Initialize a new project

If you're using Soldeer for the first time in a new Foundry project, you can use the `init` command to install a fresh instance of Soldeer, complete with the necessary configurations and the latest version of `forge-std`.

```bash
forge soldeer init
```

### Adding a Dependency

#### Add a Dependency Stored in the Central Repository

To add a dependency, you can visit [soldeer.xyz](https://soldeer.xyz) and search for the dependency you want to add (e.g., openzeppelin 5.0.2).

![image](https://i.postimg.cc/Hm6R8MTs/Unknown-413.png)

Then just run the forge command:

```bash
forge soldeer install @openzeppelin-contracts~5.0.2
```

This will download the dependency from the central repository and install it into a `dependencies` directory.

Soldeer can manage two types of dependency configuration: using `soldeer.toml` or embedded in the `foundry.toml`. In order to work with Foundry, you have to define the `[dependencies]` config in the `foundry.toml`. This will tell the `soldeer CLI` to define the installed dependencies there.
E.g.

```toml
# Full reference https://github.com/foundry-rs/foundry/tree/master/crates/config

[profile.default]
auto_detect_solc = false
bytecode_hash = "none"
fuzz = { runs = 1_000 }
libs = ["dependencies"] # <= This is important to be added
gas_reports = ["*"]

[dependencies] # <= Dependencies will be added under this config
"@openzeppelin-contracts" = { version = "5.0.2" }
"@uniswap-universal-router" = { version = "1.6.0" }
"@prb-math" = { version = "4.0.2" }
forge-std = { version = "1.8.1" }
```

#### Add a Dependency Stored at a Specific Link

If the central repository does not have a certain dependency, you can install it by providing a zip archive link.

E.g.

```bash
forge soldeer install @custom-dependency~1.0.0 --url https://my-website.com/custom-dependency-1-0-0.zip
```

The above command will try to download the dependency from the provided link and install it as a normal dependency. For this, you will see in the config an additional field called `path`.

E.g.

```toml
[dependencies]
"@custom-dependency" = { version = "1.0.0", path = "https://my-website.com/custom-dependency-1-0-0.zip" }
```

#### Add a Dependency Stored in GIT

If you choose to use Git as a source for your dependencies — though we generally discourage this, since Git isn't designed to be a dependency manager — you can provide the Git repository link as an additional argument. Soldeer will then automatically handle the installation using a Git subprocess.
For example:

```bash
forge soldeer install forge-std~1.9.2 --git https://github.com/foundry-rs/forge-std.git
```

If you want to use a specific revision, branch, or tag, you can do so by appending the following arguments to the command: `--rev/--tag/--branch`

e.g.

```bash
forge soldeer install forge-std~1.9.2 --git https://github.com/foundry-rs/forge-std.git --rev 4695fac44b2934aaa6d7150e2eaf0256fdc566a7
```

Some git examples:

Some examples:

```bash
forge soldeer install test-project~v1 --git git@github.com:test/test.git
forge soldeer install test-project~v1 --git git@gitlab.com:test/test.git
```

```bash
forge soldeer install test-project~v1 --git https://github.com/test/test.git
forge soldeer install test-project~v1 --git https://gitlab.com/test/test.git
```

```bash
forge soldeer install test-project~v1 --git git@github.com:test/test.git --rev 345e611cd84bfb4e62c583fa1886c1928bc1a464
forge soldeer install test-project~v1 --git git@github.com:test/test.git --branch dev
forge soldeer install test-project~v1 --git git@github.com:test/test.git --tag v1
```

### Updating Dependencies

Because Soldeer specifies the dependencies in a config file (foundry or soldeer toml), sharing a dependency configuration within the team is much easier.

For example, having this Foundry config file in a git repository, one can pull the repository and then run `forge soldeer update`. This command will automatically install all the dependencies specified under the `[dependencies]` tag.

```toml
# Full reference https://github.com/foundry-rs/foundry/tree/master/crates/config

[profile.default]
auto_detect_solc = false
bytecode_hash = "none"
fuzz = { runs = 1_000 }
libs = ["dependencies"] # <= This is important to be added
gas_reports = ["*"]

[dependencies] # <= Dependencies will be added under this config
"@openzeppelin-contracts" = { version = "5.0.2" }
"@uniswap-universal-router" = { version = "1.6.0" }
"@prb-math" = { version = "4.0.2" }
forge-std = { version = "1.8.1" }
```

### Removing Dependencies

You can use `forge soldeer uninstall DEPENDENCY`.

Example: `forge soldeer uninstall @openzeppelin-contracts`. This will action will remove:

- the config entry
- the `dependencies` artifacts
- the `soldeer.lock` entry
- the `remappings` entry (txt or config remapping)

Additionally you can manually remove a dependency by just removing the artifacts: dependency files, config entry, remappings entry.

### Remappings

The remappings are now fully configurable, the config TOML file (foundry.toml) accepts a
`[soldeer]` field with the following options

```toml
[soldeer]
# whether soldeer manages remappings
remappings_generate = true

# whether soldeer re-generates all remappings when installing, updating or uninstalling deps
remappings_regenerate = false

# whether to suffix the remapping with the version: `name-a.b.c`
remappings_version = true

# a prefix to add to the remappings ("@" would give `@name`)
remappings_prefix = ""

# where to store the remappings ("txt" for `remappings.txt` or "config" for `foundry.toml`)
# ignored when `soldeer.toml` is used as config (uses `remappings.txt`)
remappings_location = "txt"
```

### Installing dependencies of dependencies aka sub-dependencies

Whenever you install a dependency, that dependency might have other dependencies that need to be installed as well. Currently, you can handle this by either specifying the `recursive_deps` field as a configuration entry in the config file or by passing the `--recursive-deps` argument when running the install or update command. This will ensure that all necessary sub-dependencies are automatically pulled in.
e.g.

```toml
[soldeer]
recursive_deps = true
```

### Pushing a New Version to the Central Repository

Soldeer acts like npmjs/crates.io, encouraging all developers to publish their projects to the central repository.

To do that, you have to go to [soldeer.xyz](https://soldeer.xyz), create an account, verify it, then

![image](https://i.postimg.cc/G3VDpN2S/s1.png)

Just add a new project

![image](https://i.postimg.cc/rsBRYd3L/s2.png)

After the project is created, you can go into your project source and:

- Create a `.soldeerignore` file that acts as a `.gitignore` to exclude files that aren't needed. The `.gitignore` file is also respected.
- Run `forge soldeer login` to log into your account.
- Run `forge soldeer push my-project~1.0.0` in your terminal in the directory that you want to push to the central repository associated with the project `my-project` at version `1.0.0`.

If you want to push a specific directory and not the current directory your terminal is in, you can use `forge soldeer push my-project~1.0.0 /path/to/directory`.

**Warning** ⚠️

You are at risk to push sensitive files to the central repository that then can be seen by everyone. Make sure to exclude sensitive files in the `.soldeerignore` file.
Furthermore, we've implemented a warning that it will be triggered if you try to push a project that contains any `.dot` files/directories.
If you want to skip this warning, you can just use

```bash
forge soldeer push my-project~1.0.0 --skip-warnings
```

#### Dry-run

In case you want to simulate what would happen if you push a version, you can use the `--dry-run` flag. This will create a zip file that you can inspect before pushing it to the central repository.

```bash
forge soldeer push my-project~1.0.0 --dry-run
```

#### Login Data

By default, Soldeer saves the login token in the `~/.soldeer/.soldeer_login` file, which is used to push files to the central repository. If you prefer to save the token in a different location, you can set the environment variable `SOLDEER_LOGIN_FILE`.

> **Warning** ⚠️
>
> - Once a project is created, it cannot be deleted.
> - Once a version is pushed, it cannot be deleted.
> - You cannot push the same version twice.
> - The project name in the command that you run in the terminal must match the project name that you created on the Soldeer website.
> - We encourage everyone to use version pinning when importing them into the contracts, this will help with securing your code by knowing exactly what version of a dependency you are using. Furthermore, it will help security researchers in their work.
> - Make sure you delete this zip file before pushing the version if you run dry-run.
>   e.g. instead of using
>   `import '@openzeppelin-contracts/token/ERC20.sol'` you should do
>   `import '@openzeppelin-contracts-5.0.2/token/ERC20.sol'`

### What happens if a certain package is not present in the central repository?

- If a certain package is not present in the central repository, you can open an issue in the [Soldeer Repository](https://github.com/mario-eth/soldeer/issues) and the team will look into adding it.
- If you have a package that you want to use and it is not present in the central repository, you can push it to the central repository by following the steps above.

## Remappings Caveats

If you use other dependency managers, such as git submodules or npm, ensure you don't duplicate dependencies between
soldeer and the other manager.

Remappings targeting dependencies installed without Soldeer are not modified or removed when using Soldeer commands,
unless the `--regenerate-remappings` flag is specified or the `remappings_regenerate = true` option is set.

## Dependencies Maintenance

The vision for Soldeer is that major projects such as OpenZeppelin, Solady, Uniswap would start publishing their own
packages to the Soldeer registry so that the community can easily include them and get timely updates.

Until this happens, the Soldeer maintenance team (currently m4rio.eth) will push the most popular dependencies to the
repository by relying on their npmjs or GitHub versions. We are using
[an open-source crawler tool](https://github.com/mario-eth/soldeer-crawler) to crawl and push the dependencies under the
`soldeer` organization.

For those who want an extra layer of security, the `soldeer.lock` file saves a `SHA-256` hash for each downloaded
ZIP file and the corresponding unzipped folder (see `soldeer_core::utils::hash_folder` to see how it gets generated).
These can be compared with the official releases to ensure the files were not manipulated.

**For Project Maintainers**
If you want to move your project from the Soldeer organization and take care of pushing the versions to Soldeer
yourself, please open an issue on GitHub or contact m4rio.eth on [X (formerly Twitter)](https://twitter.com/m4rio_eth).

---
description: Configure Foundry project structure with directories for contracts, tests, dependencies, and configuration files.
---

## Project Layout

Forge is flexible on how you structure your project. By default, the structure is:

```sh
// [!include ~/snippets/output/hello_foundry/tree-with-files:output]
```

- You can configure Foundry's behavior using `foundry.toml`.
- Remappings are specified in `remappings.txt`.
- The default directory for contracts is `src/`.
- The default directory for tests is `test/`, where any contract with a function that starts with `test` is considered to be a test.
- Dependencies are stored as git submodules in `lib/`.

You can configure where Forge looks for both dependencies and contracts using the `--lib-paths` and `--contracts` flags respectively. Alternatively you can configure it in `foundry.toml`.

Combined with remappings, this gives you the flexibility needed to support the project structure of other toolchains such as Hardhat and Truffle.

For automatic Hardhat support you can also pass the `--hh` flag, which sets the following flags: `--lib-paths node_modules --contracts contracts`.