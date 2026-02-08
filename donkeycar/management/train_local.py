
import os
import sys
import subprocess
from rich.console import Console

console = Console()

def run_local_train(tub, model, model_type, transfer=None):
    """
    Executes the local training command.
    This logic is extracted from the original TrainCommand in tui.py.
    """
    cmd = ["donkey", "train", "--tub", tub, "--model", model, "--type", model_type]
    if transfer:
        cmd.extend(["--transfer", transfer])
    
    console.print(f"[bold green]Executing Local Training...[/bold green]")
    console.print(f"Command: {' '.join(cmd)}")
    
    try:
        # We run the command and stream output
        process = subprocess.Popen(
            cmd,
            stdout=sys.stdout,
            stderr=sys.stderr,
            text=True
        )
        process.wait()
        
        if process.returncode == 0:
            console.print(f"\n[bold green]✓ 本地训练成功[/bold green]")
        else:
            console.print(f"\n[bold red]✗ 本地训练失败 (Exit Code: {process.returncode})[/bold red]")
            
        return process.returncode
    except Exception as e:
        console.print(f"[bold red]✗ 异常: {e}[/bold red]")
        return 1

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run local training")
    parser.add_argument("--tub", default="./data", help="Tub directory")
    parser.add_argument("--model", required=True, help="Output model path")
    parser.add_argument("--type", default="linear", help="Model type")
    parser.add_argument("--transfer", default=None, help="Transfer model path")
    
    args = parser.parse_args()
    sys.exit(run_local_train(args.tub, args.model, args.type, args.transfer))
